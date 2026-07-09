import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: object;
}

const SITE_URL = "https://www.diavoxtech.in";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;

    document.title = title;

    const setMeta = (selector: string, attribute: string, value: string) => {
      let tag = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

      if (!tag) {
        if (selector.startsWith("link")) {
          tag = document.createElement("link");
          document.head.appendChild(tag);
        } else {
          tag = document.createElement("meta");
          document.head.appendChild(tag);
        }

        const match = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
        if (match) {
          tag.setAttribute(match[1], match[2]);
        }
      }

      tag.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);

    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", image);

    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", image);

    const existingJsonLd = document.getElementById("dynamic-jsonld");
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "dynamic-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, jsonLd]);

  return null;
}
