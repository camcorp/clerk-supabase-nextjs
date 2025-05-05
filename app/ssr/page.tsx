"use client";

import { useEffect, useState } from "react";
import AddTaskForm from "./AddTaskForm";
import { createClient } from "@supabase/supabase-js";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!
      );

      const { data, error } = await client.from("tasks").select();
      if (!error) {
        setTasks(data);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Tasks</h1>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length > 0 && tasks.map((task: any) => (
        <p key={task.id}>{task.name}</p>
      ))}

      {!loading && tasks.length === 0 && <p>No tasks found</p>}

      <AddTaskForm />
    </div>
  );
}
