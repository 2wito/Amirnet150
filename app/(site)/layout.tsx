import { SiteHeader } from "@/components/layout/site-header";

/** Standard pages: site header + centered content column. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
