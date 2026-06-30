import { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import GlassCard from '../UI/GlassCard';
import CustomDatePicker from '../UI/CustomDatePicker';
import { Plus, Search, FileText, Tag, Calendar, X, Smile, Meh, Frown, Zap, Coffee, CloudRain, CheckSquare, PenTool } from 'lucide-react';
import React from 'react';
import '../UI/UI.css';

const MOOD_ICONS = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  energetic: Zap,
  relaxed: Coffee,
  gloomy: CloudRain
};

const COLORS = {
  default: 'var(--card-bg)',
  blue: 'rgba(111, 168, 220, 0.2)',
  peach: 'rgba(244, 194, 194, 0.2)',
  green: 'rgba(143, 185, 168, 0.2)',
  yellow: 'rgba(255, 230, 153, 0.2)',
  lavender: 'rgba(182, 168, 220, 0.2)',
  mint: 'rgba(168, 220, 182, 0.2)',
  gray: 'rgba(150, 150, 150, 0.2)'
};

const NotesView = ({ tasks = [], notes = [], onSaveNote, onDeleteNote, onAddNote, onEditNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (selectedDate) {
      result = result.filter(n => {
        if (!n.updatedAt) return false;
        // updatedAt is ISO string, we want YYYY-MM-DD local
        const d = new Date(n.updatedAt);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}` === selectedDate;
      });
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(n => 
        (n.title && n.title.toLowerCase().includes(lowerQ)) || 
        (n.content && n.content.toLowerCase().includes(lowerQ))
      );
    }
    return result;
  }, [notes, searchQuery, selectedDate]);

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
          
          <div style={{ position: 'relative' }}>
            <button className="pill-btn primary" onClick={() => setShowAddMenu(!showAddMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> New Note
            </button>
            {showAddMenu && (
              <GlassCard style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '8px', gap: '4px', minWidth: '160px', background: 'var(--solid-card-bg)' }}>
                <button 
                  onClick={() => { onAddNote('text'); setShowAddMenu(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px', borderRadius: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--item-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <FileText size={16} /> Text Note
                </button>
                <button 
                  onClick={() => { onAddNote('drawing'); setShowAddMenu(false); }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px', borderRadius: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--item-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <PenTool size={16} /> Canvas Note
                </button>
              </GlassCard>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="welcome-search-wrapper" style={{
            background: 'var(--item-bg-hover)', borderRadius: '16px', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-inner)', flex: 1, minWidth: '250px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: '16px', color: 'var(--text-main)', width: '100%'
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '180px' }}>
              <CustomDatePicker 
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')} 
                className="pill-btn" 
                style={{ background: 'var(--item-bg-hover)', border: 'none', padding: '10px', display: 'flex', boxShadow: 'none' }}
                title="Clear date"
              >
                <X size={14} />
              </button>
            )}
          </div>
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
              <div key={note.id} className="note-card-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <GlassCard 
                  onClick={() => onEditNote(note)}
                  style={{ 
                    padding: '24px', 
                    cursor: 'pointer', 
                    background: bgColor,
                    border: '1px solid var(--card-border)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxSizing: 'border-box'
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
                  
                  {note.content && note.type !== 'drawing' && (
                    <div className="note-content-preview" style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-muted)', 
                      lineHeight: '1.5'
                    }} dangerouslySetInnerHTML={{ __html: note.content }} />
                  )}

                  {note.canvasImage && (
                    <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', background: 'var(--item-bg)' }}>
                      <img src={note.canvasImage} alt="Canvas Sketch" style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}

                  {!note.title && !note.content && !note.canvasImage && (
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      {note.mood && MOOD_ICONS[note.mood] && React.createElement(MOOD_ICONS[note.mood], { size: 14 })}
                      {note.linkedTasks && note.linkedTasks.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, marginLeft: '4px' }}>
                          <CheckSquare size={14} /> {note.linkedTasks.length}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
                      {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesView;
