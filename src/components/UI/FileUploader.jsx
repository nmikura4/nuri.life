import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../../firebase';
import { Paperclip, X, Download, FileText, Loader2 } from 'lucide-react';
import './UI.css';

const FileUploader = ({ fileData, onChange, onUploadStateChange, folder = 'general' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      setError("File type not supported. Please upload images, PDFs, or Office documents.");
      return;
    }

    if (fileData?.path) {
      try {
        const oldRef = ref(storage, fileData.path);
        await deleteObject(oldRef);
      } catch (err) {
        console.error("Failed to delete old file", err);
      }
    }

    const user = auth.currentUser;
    const uid = user ? user.uid : 'anonymous';
    const filePath = `uploads/${uid}/${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setError(null);
    if (onUploadStateChange) onUploadStateChange(true);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed", error);
        setError("Upload failed");
        setIsUploading(false);
        if (onUploadStateChange) onUploadStateChange(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setIsUploading(false);
        if (onUploadStateChange) onUploadStateChange(false);
        onChange({
          name: file.name,
          url: downloadURL,
          path: filePath,
          size: file.size,
          type: file.type
        });
      }
    );
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    if (fileData?.path) {
        try {
            const fileRef = ref(storage, fileData.path);
            await deleteObject(fileRef);
        } catch (err) {
            console.error("Delete failed", err);
        }
    }
    onChange(null);
  };

  if (isUploading) {
    return (
      <div className="neu-input" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', borderRadius: '12px', minHeight: '44px', justifyContent: 'center' }}>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-main)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: '4px', background: 'var(--item-bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.2s ease' }} />
        </div>
      </div>
    );
  }

  if (fileData) {
    return (
      <div className="neu-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '12px', minHeight: '44px' }}>
        <a href={fileData.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '14px', textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
          <FileText size={16} style={{ flexShrink: 0 }} color="var(--accent-blue)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileData.name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({(fileData.size / 1024 / 1024).toFixed(2)} MB)</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
           <a href={fileData.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px', color: 'var(--text-muted)', display: 'flex', borderRadius: '8px', transition: 'all 0.2s' }} title="Download file">
             <Download size={16} />
           </a>
           <button type="button" onClick={handleRemove} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '6px', display: 'flex', borderRadius: '8px', transition: 'all 0.2s' }} title="Remove file">
             <X size={16} />
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="neu-input" style={{ display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 16px', position: 'relative', borderRadius: '12px' }}>
      <input 
        type="file" 
        id={`file-upload-${folder}`}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
        onChange={handleFileChange} 
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '14px', width: '100%', pointerEvents: 'none' }}>
        <Paperclip size={16} color="var(--text-muted)" />
        <span>Attach File</span>
      </div>
      {error && <span style={{ color: 'var(--accent-coral)', fontSize: '12px', position: 'absolute', right: '16px' }}>{error}</span>}
    </div>
  );
};

export default FileUploader;
