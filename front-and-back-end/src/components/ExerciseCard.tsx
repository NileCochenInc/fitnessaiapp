"use client";
import Button from '@/components/Button';

type ExerciseCardProps = {
  exercise_id: number;
  name: string;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
};

export default function ExerciseCard({ exercise_id, name, onDelete, onEdit }: ExerciseCardProps) {
  return (
    <li className="flex items-center justify-between bg-[#36393f] p-4 rounded-xl shadow-lg mb-2 w-full flex-nowrap">
      {/* Left side: exercise name */}
      <div className="text-[#dcddde] mr-4 flex-shrink">
        <p className="font-semibold">{name}</p>
      </div>

      {/* Right side: buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          label="Edit Data"
          onClick={() => onEdit(exercise_id)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg transition-colors duration-200 inline-flex w-auto"
        />
        <button
          onClick={() => onDelete(exercise_id)}
          className="text-[#ed4245] hover:bg-[#b3393c] hover:text-white p-2 rounded-lg transition-colors duration-200 inline-flex cursor-pointer"
          aria-label="Delete exercise"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
