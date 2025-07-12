import { ProfileSchema } from '@/app/lib/validations/database'

export function ProfileForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      avatar_url: formData.get('avatar_url') as string,
    }
    console.log('Datos validados:', data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="usuario@ejemplo.com"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          Nombre Completo
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          placeholder="Nombre completo del usuario"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium">
          Avatar URL
        </label>
        <input
          type="url"
          id="avatar_url"
          name="avatar_url"
          placeholder="https://ejemplo.com/avatar.jpg"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Guardar Perfil
      </button>
    </form>
  )
}