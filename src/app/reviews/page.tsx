import type { Metadata } from 'next';
import { ReviewsSection } from '@/components/ReviewsSection';

export const metadata: Metadata = {
  title: 'Reseñas verificadas | Lux Store',
  description:
    'Opiniones reales de clientes que recibieron productos digitales de Lux Store.',
};

export default function ReviewsPage() {
  return (
    <div className="-mt-24">
      <ReviewsSection
        limit={48}
        showAllLink={false}
        title="Reseñas de clientes"
      />
    </div>
  );
}
