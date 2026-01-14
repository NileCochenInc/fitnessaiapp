// components/WorkoutCard.tsx
import Button from '@/components/Button';


type ExerciseCardProps = {
    exercise_id: number,
    name: string;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
};

export default function ExerciseCard( { exercise_id, name, onDelete, onEdit }: ExerciseCardProps) {
  return (
    <li className="flex items-center justify-between border p-3 rounded mb-2">
        <div>
            <p><strong>{name}</strong></p>
        </div>    
            
            
            {/* Right side: delete button */}
        <div className="flex items-center gap-2">
            <Button label="Edit Data" onClick={() => onEdit(exercise_id)} />
            <button
                onClick={() => onDelete(exercise_id)}
                className="text-red-500 hover:text-red-700 transition-colors text-lg cursor-pointer"
                aria-label="Delete exercise"
                >
                🗑️
            </button>
        </div>
    </li>
  );
}