async page => {
  const { readFileSync } = await import('fs');
  const html = readFileSync('C:\\Users\\fede8\\Documents\\OficiosYa\\mockup-flujo.html', 'utf8');
  await page.setContent(html, { waitUntil: 'load' });
}
