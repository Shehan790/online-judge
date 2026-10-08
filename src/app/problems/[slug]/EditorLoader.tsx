"use client";

import dynamic from "next/dynamic";

const EditorComponent = dynamic(() => import("./EditorComponent"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border rounded animate-pulse bg-gray-100 dark:bg-gray-800 h-[400px]">
      Loading editor...
    </div>
  ),
});

export default function EditorLoader({ slug }: { slug: string }) {
  return <EditorComponent slug={slug} />;
}
