import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { Experience } from '../../types';
import { SortableBullet } from './SortableBullet';

interface SortableExperienceProps {
  experience: Experience;
  index: number;
  totalExperiences: number;
  sectionId: string;
  onUpdate: (sectionId: string, expId: string, field: keyof Experience, value: string) => void;
  onDelete: (sectionId: string, expId: string) => void;
  onMoveUp: (sectionId: string, index: number) => void;
  onMoveDown: (sectionId: string, index: number) => void;
  onUpdateBullet: (sectionId: string, parentId: string, bulletId: string, text: string) => void;
  onDeleteBullet: (sectionId: string, parentId: string, bulletId: string) => void;
  onAddBullet: (sectionId: string, parentId: string) => void;
  onMoveBulletUp: (sectionId: string, parentId: string, index: number) => void;
  onMoveBulletDown: (sectionId: string, parentId: string, index: number) => void;
}

export const SortableExperience: React.FC<SortableExperienceProps> = ({
  experience,
  index,
  totalExperiences,
  sectionId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateBullet,
  onDeleteBullet,
  onAddBullet,
  onMoveBulletUp,
  onMoveBulletDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: experience.id,
    data: {
      type: 'experience',
      sectionId,
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5, backgroundColor: 'rgba(246, 241, 231, 0.4)', outline: '1px solid #AAC06A', zIndex: 10 } : {}),
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  const bulletIds = experience.bullets.map((b) => b.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/exp p-2.5 -mx-8 pl-8 rounded-lg transition-colors duration-100 hover:bg-[#F6F1E7]/40 relative"
    >
      {/* Drag Handle */}
      <div 
        className="absolute left-1.5 top-3 opacity-0 group-hover/exp:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded cursor-grab active:cursor-grabbing outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"
        {...attributes}
        {...listeners}
        aria-label="Reorder experience"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex justify-between items-baseline gap-2">
        <input
          type="text"
          value={experience.company}
          onChange={(e) => onUpdate(sectionId, experience.id, 'company', e.target.value)}
          placeholder="Company Name"
          className="font-semibold text-[#1F1F1B] text-sm bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 flex-1 min-w-0"
        />
        <div className="flex items-center gap-1 shrink-0 ml-2 relative" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <input
            type="text"
            value={experience.startDate}
            onChange={(e) => onUpdate(sectionId, experience.id, 'startDate', e.target.value)}
            placeholder="Start"
            className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16"
          />
          <span className="text-xs text-[#6E6A62] font-medium">–</span>
          <input
            type="text"
            value={experience.endDate}
            onChange={(e) => onUpdate(sectionId, experience.id, 'endDate', e.target.value)}
            placeholder="End"
            className="text-xs text-[#6E6A62] font-medium bg-transparent border-0 outline-none p-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 text-right w-16"
          />
          
          {/* More Menu */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={handleMenuClick}
              className="opacity-0 group-hover/exp:opacity-100 focus-within:opacity-100 p-1 text-[#6E6A62] hover:text-[#1F1F1B] rounded transition-opacity cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#AAC06A]"
              aria-label="Experience options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#E2DACF] rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => { onMoveUp(sectionId, index); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1F1F1B] hover:bg-[#F6F1E7] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-3.5 h-3.5" /> Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === totalExperiences - 1}
                    onClick={() => { onMoveDown(sectionId, index); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1F1F1B] hover:bg-[#F6F1E7] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-3.5 h-3.5" /> Move down
                  </button>
                  <div className="h-px bg-[#E2DACF]/60 my-1" />
                  <button
                    type="button"
                    onClick={() => { onDelete(sectionId, experience.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <input
        type="text"
        value={experience.role}
        onChange={(e) => onUpdate(sectionId, experience.id, 'role', e.target.value)}
        placeholder="Job Title / Role"
        className="text-xs font-medium text-[#6E6A62] bg-transparent border-0 outline-none p-0.5 -ml-0.5 rounded transition-colors hover:bg-black/[0.02] focus:ring-1 focus:ring-[#AAC06A]/60 w-full mb-1"
      />
      
      {/* Bullet points Context */}
      <div className="space-y-1 mt-1">
        <SortableContext items={bulletIds} strategy={verticalListSortingStrategy}>
          {experience.bullets.map((bullet, bIndex) => (
            <SortableBullet
              key={bullet.id}
              bullet={bullet}
              index={bIndex}
              totalBullets={experience.bullets.length}
              sectionId={sectionId}
              parentId={experience.id}
              onUpdate={onUpdateBullet}
              onDelete={onDeleteBullet}
              onMoveUp={onMoveBulletUp}
              onMoveDown={onMoveBulletDown}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add bullet button */}
      <div className="mt-1.5 pl-2">
        <button
          type="button"
          onClick={() => onAddBullet(sectionId, experience.id)}
          className="flex items-center gap-1 text-[11px] font-medium text-[#6E6A62]/70 hover:text-[#1F1F1B] py-0.5 px-1.5 rounded hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add bullet</span>
        </button>
      </div>
    </div>
  );
};
