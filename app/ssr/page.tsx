import { createServerSupabaseClient } from "./client";
import AddTaskForm from "./AddTaskForm";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  const client = createServerSupabaseClient();

  // Query the 'tasks' table to render the list of tasks
  const { data, error } = await client.from("tasks").select();
  if (error) {
    return { props: { tasks: [] } };
  }
  return { props: { tasks: data } };
};

export default function Home({ tasks }: { tasks: any[] }) {
  return (
    <div>
      <h1>Tasks</h1>

      <div>
        {tasks?.map((task: any) => (
          <p key={task.id}>{task.name}</p>
        ))}
      </div>

      <AddTaskForm />
    </div>
  );
}
