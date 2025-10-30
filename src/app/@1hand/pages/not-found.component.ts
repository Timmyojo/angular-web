import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: false,
  template: `
    <div
      class="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10 text-center"
    >
      <h1 class="text-[120px] font-extrabold text-[#1D9BED] leading-none">
        404
      </h1>
      <h2 class="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
        Page Not Found
      </h2>
      <p class="text-gray-600 mb-8 text-sm md:text-base max-w-md">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>
      <a
        href="/"
        class="inline-block px-6 py-3 bg-[#1D9BED] text-white text-sm font-medium rounded hover:bg-blue-600 transition"
      >
        Go to Homepage
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
