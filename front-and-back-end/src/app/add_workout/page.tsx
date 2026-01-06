"use client"; // must be client component for interactivity


import { useRouter } from "next/navigation";



export default function Page() {
    const router = useRouter();
    

    return (
        <div>
        <h1>Add workout</h1>
        <form>
            <label>
                Date:
                <input type="text"></input>
            </label>
            <label>
                Workout type:
                <input type="text"></input>
            </label>
        </form>
        </div>
        );

}