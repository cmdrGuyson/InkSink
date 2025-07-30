export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col row-start-2 items-center justify-center ">
        <h1 className=" font-mono text-4xl">InkSink</h1>
        <p className="font-mono text-sm/6 text-center sm:text-left">
          The Kitchen Sink for Writing Content
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-12">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-small text-sm h-10 sm:h-12 px-4 sm:px-5 sm:w-auto font-mono"
            href="/write"
            rel="noopener noreferrer"
          >
            Get Started
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 font-mono text-sm"
          href="https://www.guyson.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ by a Human
        </a>
      </footer>
    </div>
  );
}
