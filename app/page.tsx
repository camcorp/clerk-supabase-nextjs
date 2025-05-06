"use client";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser();

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to Clerk + Supabase + Next.js</h1>
      {user && (
        <p className="text-lg">Hello, {user.firstName || user.username || 'User'}!</p>
      )}
      {!user && (
        <p className="text-lg">Please sign in to get started.</p>
      )}
    </div>
  );
}
