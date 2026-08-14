'use client'

import { Trash2 } from 'lucide-react'
import { deleteStudentAction } from '@/lib/actions'

export function DeleteStudentButton({ id, fullName }: { id: string; fullName: string }) {
  return (
    <form
      action={deleteStudentAction}
      onSubmit={(event) => {
        if (!confirm(`Remove ${fullName}? This deletes their record and evaluation history.`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-danger py-1" type="submit">
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Delete
      </button>
    </form>
  )
}
