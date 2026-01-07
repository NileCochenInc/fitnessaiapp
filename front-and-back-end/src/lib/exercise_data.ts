
//accept json of entries each with list of metrics
export async function createExerciseData(workoutExerciseId: number, workoutData: JSON) {
    //redo this****


    //get current exercise

    //for each entry

        //add entry to database at weID

        //if weID doesnt exist throw error

        //for each metric

            //add metric to database

            //check if metric has been used before

                //if used

                    //check if metric isnt global and isnt in junction table with current exercise

                        //add exercise and metric to junction table

                    //add metric_definition foreign key

                //if not used

                    //add metric to definitions

                    //add metric and exercise to junction table

                    //add metric_definition foreign key


}
