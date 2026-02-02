<script>
  import PdfViewer from '$lib/PdfViewer.svelte';

  /** @type {string} */
  let pdfUrl = 'https://kraxen72.github.io/cdn/test-pdf/data_mining_preprocessing.pdf';

  const pdfs = [
    { name: 'Data Mining Preprocessing', url: 'https://kraxen72.github.io/cdn/test-pdf/data_mining_preprocessing.pdf' },
    { name: 'Most', url: 'https://kraxen72.github.io/cdn/test-pdf/most.pdf' },
    { name: 'Na Orlích Křídlách', url: 'https://kraxen72.github.io/cdn/test-pdf/na_orlich_kridlach.pdf' },
    { name: 'Pane Přijmi Mà', url: 'https://kraxen72.github.io/cdn/test-pdf/pane_prijmi_ma.pdf' }
  ];

  function switchPdf(url) {
    pdfUrl = url;
  }
</script>

<div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
  {#each pdfs as pdf}
    <button on:click={() => switchPdf(pdf.url)} style="padding: 0.5rem 1rem; cursor: pointer;">
      {pdf.name}
    </button>
  {/each}
</div>

<PdfViewer initialPdfUrl={pdfUrl} />