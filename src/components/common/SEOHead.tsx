import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export default function SEOHead({
  title = 'Meena Rajwada – Handcrafted Jewellery',
  description = 'Exquisite handmade bangles, bridal jewellery, and custom pieces crafted with love. Explore the Meena Rajwada collection.',
  image = '/og-image.jpg',
  url = 'https://www.meenarajwada.com',
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title.includes('Meena Rajwada') ? title : `${title} | Meena Rajwada`
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}
