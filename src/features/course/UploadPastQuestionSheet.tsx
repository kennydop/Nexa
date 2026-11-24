import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FilePicker } from '@/components/ui/file-picker'
import { Field } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Select } from '@/components/ui/select'
import { Sheet } from '@/components/ui/sheet'
import type { ExamType } from '@/data/types'
import { useAddPastQuestion } from '@/hooks/queries'
import { validateFile } from '@/lib/files'
import { errorMessage } from '@/lib/utils'
import { EXAM_LABEL } from './meta'

const YEARS_BACK = 15
const thisYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: YEARS_BACK }, (_, i) => String(thisYear - i)).map((y) => ({ value: y, label: y }))
const EXAM_OPTIONS = (Object.keys(EXAM_LABEL) as ExamType[]).map((value) => ({ value, label: EXAM_LABEL[value] }))

interface Props {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadPastQuestionSheet({ courseId, open, onOpenChange }: Props) {
  const addPastQuestion = useAddPastQuestion()
  const [year, setYear] = useState(String(thisYear))
  const [semester, setSemester] = useState<'1' | '2'>('1')
  const [examType, setExamType] = useState<ExamType>('end_of_semester')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>()

  function submit(event: FormEvent) {
    event.preventDefault()
    const problem = file ? validateFile(file) : 'Choose the paper to upload.'
    setFileError(problem ?? undefined)
    if (problem || !file) return
    addPastQuestion.mutate(
      { courseId, year: Number(year), semester: Number(semester) as 1 | 2, examType, file },
      {
        onSuccess: () => {
          toast.success('Past question uploaded. You’re a legend!')
          setFile(null)
          onOpenChange(false)
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Upload past questions" description="A clear PDF or photo of the paper works best.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year" htmlFor="pq-year">
            <Select id="pq-year" value={year} onChange={setYear} options={YEAR_OPTIONS} />
          </Field>
          <Field label="Exam" htmlFor="pq-type">
            <Select id="pq-type" value={examType} onChange={(v) => setExamType(v as ExamType)} options={EXAM_OPTIONS} />
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Semester</p>
          <Segmented
            label="Semester"
            value={semester}
            onChange={setSemester}
            options={[
              { value: '1', label: 'First' },
              { value: '2', label: 'Second' },
            ]}
          />
        </div>
        <Field label="Paper" htmlFor="pq-file" error={fileError}>
          <FilePicker id="pq-file" file={file} onChange={setFile} invalid={Boolean(fileError)} />
        </Field>
        <Button type="submit" size="lg" block disabled={addPastQuestion.isPending}>
          {addPastQuestion.isPending ? 'Uploading…' : 'Upload'}
        </Button>
      </form>
    </Sheet>
  )
}
