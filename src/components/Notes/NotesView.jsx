import { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import GlassCard from '../UI/GlassCard';
import NoteModal from './NoteModal';
import { Plus, Search, FileText, Tag } from 'lucide-react';
import '../UI/UI.css';

const COLORS = {
  default: 'var(--card-bg)',
  blue: 'rgba(111, 168, 220, 0.2)',
  peach: 'rgba(244, 194, 194, 0.2)',
  green: 'rgba(143, 185, 168, 0.2)',
  yellow: 'rgba(255, 230, 153, 0.2)',
};

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
      const loadedNotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort notes by updatedAt, newest first
      loadedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setNotes(loadedNotes);
    }, (error) => {
      console.error("Error reading notes:", error);
    });

    return () => unsub();
  }, []);

  const handleOpenNewNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const id = noteData.id || crypto.randomUUID();
      await setDoc(doc(db, "notes", id.toString()), { ...noteData, id });
    } catch (e) {
      alert("Error saving note: " + e.message);
      console.error(e);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id.toString()));
    } catch (e) {
      alert("Error deleting note: " + e.message);
      console.error(e);
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const lowerQ = searchQuery.toLowerCase();
    return notes.filter(n => 
      (n.title && n.title.toLowerCase().includes(lowerQ)) || 
      (n.content && n.content.toLowerCase().includes(lowerQ))
    );
  }, [notes, searchQuery]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header and Controls */}
      <GlassCard className="welcome-card-header" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>My Notes</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} recorded
            </p>
          </div>
          
          <button className="pill-btn primary" onClick={handleOpenNewNote} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> New Note
          </button>
        </div>

        <div className="welcome-search-wrapper" style={{
          background: 'var(--item-bg-hover)', borderRadius: '16px', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-inner)'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'inherit', fontSize: '14px', color: 'var(--text-main)', width: '100%'
            }}
          />
        </div>
      </GlassCard>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <GlassCard style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>No notes found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
            {searchQuery ? "Try a different search term" : "Click 'New Note' to write your first thought!"}
          </p>
        </GlassCard>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => {
            const bgColor = COLORS[note.color] || COLORS.default;
            return (
              <div key={note.id} className="note-card-wrapper">
                <GlassCard 
                  onClick={() => handleEditNote(note)}
                  style={{ 
                    padding: '24px', 
                    cursor: 'pointer', 
                    background: bgColor,
                    border: '1px solid var(--card-border)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {note.title && (
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-main)' }}>
                      {note.title}
                    </h3>
                  )}
                  
                  {note.content && (
                    <div className="note-content-preview" style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-muted)', 
                      lineHeight: '1.5'
                    }}>
                      {note.content}
                    </div>
                  )}

                  {!note.title && !note.content && (
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Empty note
                    </div>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {note.tags.map(tag => (
                        <span key={tag} style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px', 
                          fontSize: '11px', background: 'var(--card-bg)', 
                          padding: '2px 8px', borderRadius: '8px', color: 'var(--text-muted)',
                          border: '1px solid var(--card-border)'
                        }}>
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}

      <NoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        note={editingNote}
      />

    </div>
  );
};

export default NotesView;
