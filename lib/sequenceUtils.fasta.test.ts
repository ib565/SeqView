import { validateFasta } from './sequenceUtils';

/**
 * Minimal, dependency-free test harness for validateFasta.
 * Run with: npx tsx lib/sequenceUtils.fasta.test.ts
 */

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function runValidateFastaTests(): void {
  // Single-record FASTA with header and wrapped lines
  {
    const fasta = ['>my-seq', 'ATGC', 'GATTACA'].join('\n');
    const result = validateFasta(fasta);

    assert(result.valid === true, 'Expected valid FASTA with header');
    assert(!!result.sequence, 'Expected sequence to be defined');
    assert(result.sequence === 'ATGCGATTACA', 'Unexpected sequence from FASTA with header');
    assert(result.nameFromHeader === 'my-seq', 'Expected nameFromHeader to match header');
  }

  // FASTA without header
  {
    const fasta = 'ATGC\nGATTACA';
    const result = validateFasta(fasta);

    assert(result.valid === true, 'Expected valid FASTA without header');
    assert(result.sequence === 'ATGCGATTACA', 'Unexpected sequence from FASTA without header');
    assert(result.nameFromHeader === undefined, 'Expected no nameFromHeader without header');
  }

  // Multi-FASTA: only first record should be used
  {
    const fasta = ['>first', 'ATGC', '>second', 'GATTACA'].join('\n');
    const result = validateFasta(fasta);

    assert(result.valid === true, 'Expected valid multi-FASTA');
    assert(result.sequence === 'ATGC', 'Expected only first record to be used');
    assert(result.nameFromHeader === 'first', 'Expected first header to be used');
  }

  // Header only → error
  {
    const fasta = '>only-header';
    const result = validateFasta(fasta);

    assert(result.valid === false, 'Expected invalid FASTA when no sequence lines are present');
    assert(
      !!result.error && /No sequence found/i.test(result.error),
      'Expected "No sequence found" error'
    );
  }
}

runValidateFastaTests();
console.log('validateFasta tests passed.');


