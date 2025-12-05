/**
 * Standard genetic code: Codon → Amino Acid (one-letter code)
 * 
 * For DNA sequences, T is treated as U (standard practice)
 * Stop codons are represented as '*'
 */

export const CODON_TABLE: Record<string, string> = {
  // UUU, UUC - Phenylalanine
  'UUU': 'F',
  'UUC': 'F',
  
  // UUA, UUG, CUU, CUC, CUA, CUG - Leucine
  'UUA': 'L',
  'UUG': 'L',
  'CUU': 'L',
  'CUC': 'L',
  'CUA': 'L',
  'CUG': 'L',
  
  // AUU, AUC, AUA - Isoleucine
  'AUU': 'I',
  'AUC': 'I',
  'AUA': 'I',
  
  // AUG - Methionine (START codon)
  'AUG': 'M',
  
  // GUU, GUC, GUA, GUG - Valine
  'GUU': 'V',
  'GUC': 'V',
  'GUA': 'V',
  'GUG': 'V',
  
  // UCU, UCC, UCA, UCG - Serine
  'UCU': 'S',
  'UCC': 'S',
  'UCA': 'S',
  'UCG': 'S',
  
  // CCU, CCC, CCA, CCG - Proline
  'CCU': 'P',
  'CCC': 'P',
  'CCA': 'P',
  'CCG': 'P',
  
  // ACU, ACC, ACA, ACG - Threonine
  'ACU': 'T',
  'ACC': 'T',
  'ACA': 'T',
  'ACG': 'T',
  
  // GCU, GCC, GCA, GCG - Alanine
  'GCU': 'A',
  'GCC': 'A',
  'GCA': 'A',
  'GCG': 'A',
  
  // UAU, UAC - Tyrosine
  'UAU': 'Y',
  'UAC': 'Y',
  
  // UAA, UAG - STOP codons
  'UAA': '*',
  'UAG': '*',
  
  // CAU, CAC - Histidine
  'CAU': 'H',
  'CAC': 'H',
  
  // CAA, CAG - Glutamine
  'CAA': 'Q',
  'CAG': 'Q',
  
  // AAU, AAC - Asparagine
  'AAU': 'N',
  'AAC': 'N',
  
  // AAA, AAG - Lysine
  'AAA': 'K',
  'AAG': 'K',
  
  // GAU, GAC - Aspartic acid
  'GAU': 'D',
  'GAC': 'D',
  
  // GAA, GAG - Glutamic acid
  'GAA': 'E',
  'GAG': 'E',
  
  // UGU, UGC - Cysteine
  'UGU': 'C',
  'UGC': 'C',
  
  // UGA - STOP codon
  'UGA': '*',
  
  // UGG - Tryptophan
  'UGG': 'W',
  
  // CGU, CGC, CGA, CGG, AGA, AGG - Arginine
  'CGU': 'R',
  'CGC': 'R',
  'CGA': 'R',
  'CGG': 'R',
  'AGA': 'R',
  'AGG': 'R',
  
  // AGU, AGC - Serine
  'AGU': 'S',
  'AGC': 'S',
  
  // GGU, GGC, GGA, GGG - Glycine
  'GGU': 'G',
  'GGC': 'G',
  'GGA': 'G',
  'GGG': 'G',
};

/**
 * Convert DNA codon to RNA codon (T → U)
 */
export function dnaToRnaCodon(dnaCodon: string): string {
  return dnaCodon.toUpperCase().replace(/T/g, 'U');
}

/**
 * Translate a codon to amino acid
 * Handles both DNA (T) and RNA (U) codons
 */
export function translateCodon(codon: string): string {
  const rnaCodon = dnaToRnaCodon(codon);
  return CODON_TABLE[rnaCodon] || '?';
}

/**
 * Check if a codon is a stop codon
 */
export function isStopCodon(codon: string): boolean {
  return translateCodon(codon) === '*';
}

