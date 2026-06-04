import { useEffect, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { RequestCard } from '../components/requests/RequestCard'
import { ReviewForm } from '../components/requests/ReviewForm'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useRequestStore } from '../store/requestStore'

export default function MisSolicitudes() {
  const { requests, loading, loadRequests } = useRequestStore()
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  useEffect(() => { loadRequests() }, [])

  const handleReviewSubmit = async (rating: number, comment: string) => {
    console.log('Review submitted:', { rating, comment, requestId: reviewingId })
    // En producción: supabase.from('reviews').insert({ request_id: reviewingId, rating, comment })
  }

  return (
    <PageShell header={<Header title="Mis solicitudes" />}>
      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        {!loading && requests.length === 0 && (
          <p className="text-center text-gray-400 py-8">No tenés solicitudes aún</p>
        )}
        {requests.map((req) => (
          <div key={req.id} className="flex flex-col gap-2">
            <RequestCard request={req} />
            {req.status === 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewingId(req.id)}
              >
                Dejar reseña
              </Button>
            )}
          </div>
        ))}
      </div>

      {reviewingId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-md">
            <ReviewForm
              requestId={reviewingId}
              onSubmit={handleReviewSubmit}
              onClose={() => setReviewingId(null)}
            />
          </div>
        </div>
      )}
    </PageShell>
  )
}
