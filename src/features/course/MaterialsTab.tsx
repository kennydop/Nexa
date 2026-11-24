import { FolderSimple, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FileOpener } from '@/components/viewer/FileOpener'
import { MediaBadge } from '@/components/viewer/MediaBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/context'
import { OfflinePackTeaser } from '@/features/plans/OfflinePackTeaser'
import { useMaterials } from '@/hooks/queries'
import { cn, timeAgo } from '@/lib/utils'
import { KIND_META } from './meta'
import { UploadMaterialSheet } from './UploadMaterialSheet'

export function MaterialsTab({ courseId }: { courseId: string }) {
  const { userId, requestSignIn } = useAuth()
  const materials = useMaterials(courseId)
  const [uploading, setUploading] = useState(false)
  const openUpload = () =>
    userId ? setUploading(true) : requestSignIn('Sign in to share slides, notes and links.')

  return (
    <div className="flex flex-col gap-4">
      <Button variant="secondary" onClick={openUpload} className="self-start">
        <Plus size={18} weight="bold" />
        Add material
      </Button>

      {Boolean(materials.data?.length) && <OfflinePackTeaser />}

      {materials.isPending ? (
        Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[4.5rem]" />)
      ) : materials.data?.length ? (
        <ul className="-mx-2 flex flex-col">
          {materials.data.map((m) => {
            const meta = KIND_META[m.kind]
            return (
              <li key={m.id}>
                <FileOpener
                  file={{ title: m.title, subtitle: `${meta.label} · ${m.uploaderName}`, url: m.url, mimeType: m.mimeType }}
                  className="flex w-full items-center gap-3 rounded-[20px] p-2 text-left transition-colors duration-150 hover:bg-surface-2"
                >
                  <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', meta.tint)}>
                    <meta.icon size={26} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-bold leading-snug">{m.title}</span>
                    <span className="block text-sm text-muted">
                      {meta.label} · {m.uploaderName} · {timeAgo(m.createdAt)}
                    </span>
                  </span>
                  <MediaBadge url={m.url} mimeType={m.mimeType} />
                </FileOpener>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={FolderSimple}
          title="No materials yet"
          body="Have slides, notes or a great video for this course? Share them so everyone can learn."
        />
      )}

      <UploadMaterialSheet courseId={courseId} open={uploading} onOpenChange={setUploading} />
    </div>
  )
}
