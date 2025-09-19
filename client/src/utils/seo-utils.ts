// SEO utility functions for dynamic content
export const generateVideoStructuredData = (videoInfo: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": videoInfo.title,
    "description": `Download ${videoInfo.title} from ${videoInfo.platform}`,
    "thumbnailUrl": videoInfo.thumbnailUrl,
    "duration": videoInfo.duration ? `PT${videoInfo.duration}S` : undefined,
    "author": {
      "@type": "Person",
      "name": videoInfo.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "SocialGrab",
      "url": "https://socialgrab.app"
    },
    "interactionStatistic": videoInfo.views ? {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": parseInt(videoInfo.views.replace(/[^0-9]/g, ''))
    } : undefined
  };
};

export const generateBreadcrumbStructuredData = (path: string) => {
  const pathSegments = path.split('/').filter(segment => segment);
  const breadcrumbs = [
    { name: 'Home', url: 'https://socialgrab.app/' }
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      name: name,
      url: `https://socialgrab.app${currentPath}`
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
};

export const generateFAQStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I download videos from Facebook?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply paste the Facebook video URL into our downloader, select your preferred quality, and click download. Our tool works with all Facebook video formats."
        }
      },
      {
        "@type": "Question",
        "name": "Is it free to download TikTok videos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SocialGrab is completely free to use. You can download unlimited TikTok videos without any registration or payment."
        }
      },
      {
        "@type": "Question",
        "name": "What video qualities are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer multiple quality options including HD, SD, and low quality depending on the source video. You can choose the best quality that suits your needs."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No installation required. SocialGrab is a web-based tool that works directly in your browser on any device."
        }
      }
    ]
  };
};