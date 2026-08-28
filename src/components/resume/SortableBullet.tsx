import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Bullet } from '../../types';
import { AutoResizeTextarea } from '../AutoResizeTextarea';

interface SortableBulletProps {
  bullet: Bullet;
  index: number;
  totalBullets: number;
  sectionId: string;
  parentId: string;
  onUpdate: (sectionId: string, parentId: string, bulletId: string, text: string) => void;
  onDelete: (sectionId: string, parentId: string, bulletId: string) => void;
  onMoveUp: (sectionId: string, parentId: string, index: number) => void;
  onMoveDown: (sectionId: string, parentId: string, index: number) => void;
}

export const SortableBullet: React.FC<SortableBulletProps> = ({
  bullet,
  index,
  totalBullets,
  sectionId,
  parentId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: bullet.id,
    data: {
      type: 'bullet',
      parentId,
      sectionId,
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5, backgroundColor: 'rgba(246, 241, 231, 0.4)', zIndex: 10 } : {}),
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group/bullet relative flex items-start gap-1 text-xs text-[#1F1F1B]/90 leading-relaxed -ml-6 pl-6 rounded transition-colors focus-within:bg-[#F6F1E7]/20 hover:bg-[#F6F1E7]/20"
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-1 top-1 opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center p-0.5 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"
        {...attributes}
        {...listeners}
        aria-label="Reorder bullet"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <span className="select-none text-[#1F1F1B]/60 mt-1 shrink-0">•</span>
      <AutoResizeTextarea
        value={bullet.text}
        onChange={(text) => onUpdate(sectionId, parentId, bullet.id, text)}
        placeholder="Describe action, context, and tangible result..."
        className="flex-1 bg-transparent border-0 outline-none text-xs text-[#1F1F1B]/90 leading-relaxed p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60"
      />
      
      {/* More Menu */}
      <div className="relative shrink-0 mt-0.5">
        <button
          type="button"
          onClick={handleMenuClick}
          className="opacity-0 group-hover/bullet:opacity-100 focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"
          aria-label="Bullet options"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#E2DACF] rounded-lg shadow-lg z-50 py-1 overflow-hidden">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => { onMoveUp(sectionId, parentId, index); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1F1F1B] hover:bg-[#F6F1E7] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Move up
              </button>
              <button
                type="button"
                disabled={index === totalBullets - 1}
                onClick={() => { onMoveDown(sectionId, parentId, index); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1F1F1B] hover:bg-[#F6F1E7] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-3.5 h-3.5" /> Move down
              </button>
              <div className="h-px bg-[#E2DACF]/60 my-1" />
              <button
                type="button"
                onClick={() => { onDelete(sectionId, parentId, bullet.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
