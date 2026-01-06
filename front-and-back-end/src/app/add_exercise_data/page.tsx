"use client"; // must be client component for interactivity

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from '../../components/Button';



type Entry = {
  metric: string;
  value: string;
  unit: string;
};




export default function Page() {
    const router = useRouter();

    const [metrics, setMetrics] = useState<Entry[]>([
        { metric: "", value: "", unit: "" } //start with one blank entry in entries (to be overwritten)
    ]);

    const addMetric = () => {
        setMetrics(prev => [
            ...prev,
            { metric: "", value: "", unit: "" }
        ]);
    };

    const updateMetrics = (
        index: number,
        field: keyof Entry,
        value: string
    ) => {
        setMetrics(prev =>
            prev.map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            )
        );
    };

    

    const pushExercise = () => {
        //push workout_exercise to backend
        //push excercise name
    };



    return (
        <div>
            <h1>**exercise**</h1>
            <h2>Add data</h2>
            <h1>Add entry</h1>
            <form>
                {metrics.map((entry, index) => ( 
                    <div key={index}>
                        <label>
                            metric:
                            <input 
                                type="text" 
                                placeholder="weight"
                                value={entry.metric}
                                onChange={e =>
                                    updateMetrics(index, "metric", e.target.value)
                                }
                            />
                        </label>
                        <label>
                            data:
                            <input 
                                type="text"
                                value={entry.value}
                                onChange={e =>
                                    updateMetrics(index, "value", e.target.value)
                                }
                            />
                        </label>
                        <label>
                            Unit:
                            <input 
                                type="text" 
                                placeholder="lbs"
                                value={entry.unit}
                                onChange={e =>
                                    updateMetrics(index, "unit", e.target.value)
                                }
                            />
                        </label>
                        
                    </div>
                ))}
                <Button 
                    label="Add other metric"
                    onClick={addMetric}
                    type="button"
                /> {/* add another entry form */}
            </form>
            <Button label="save" />
        </div>
        );

}