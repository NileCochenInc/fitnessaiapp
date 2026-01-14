// components/WorkoutCard.tsx
import Button from '@/components/Button';


type WorkoutCardProps = {
    id: number,
    workout_date: string;
    workout_kind: string;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
};

export default function WorkoutCard( { id, workout_date, workout_kind, onDelete, onEdit }: WorkoutCardProps) {
  return (
    <li className="flex items-center justify-between border p-3 rounded mb-2">
        <div>
            <p><strong>Date:</strong> {workout_date}</p>
            <p><strong>Type:</strong> {workout_kind}</p>
        </div>    
            
            
            {/* Right side: delete button */}
        <div className="flex items-center gap-2">
            <Button label="Edit" onClick={() => onEdit(id)} />
            <button
                onClick={() => onDelete(id)}
                className="text-red-500 hover:text-red-700 transition-colors text-lg cursor-pointer"
                aria-label="Delete workout"
                >
                🗑️
            </button>
        </div>
    </li>
  );
}