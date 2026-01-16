import Button from '@/components/Button';

type WorkoutCardProps = {
  id: number;
  workout_date: string;
  workout_kind: string;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
};

export default function WorkoutCard({ id, workout_date, workout_kind, onDelete, onEdit }: WorkoutCardProps) {
  return (
    <li className="flex items-center justify-between bg-[#36393f] p-4 rounded-xl shadow-lg mb-2 w-full flex-nowrap">
      {/* Left side: workout info */}
      <div className="text-[#dcddde] mr-4 flex-shrink">
        <p><strong>Date:</strong> {workout_date}</p>
        <p><strong>Type:</strong> {workout_kind}</p>
      </div>

      {/* Right side: buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          label="Edit"
          onClick={() => onEdit(id)}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white p-2 rounded-lg transition-colors duration-200 inline-flex w-auto"
        />
        <button
          onClick={() => onDelete(id)}
          className="text-[#ed4245] hover:bg-[#b3393c] hover:text-white p-2 rounded-lg transition-colors duration-200 inline-flex cursor-pointer"
          aria-label="Delete workout"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
