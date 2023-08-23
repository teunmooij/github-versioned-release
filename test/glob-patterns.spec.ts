import { getIncludePatterns, getExcludePatterns } from '../src/glob-patterns';

jest.mock('node:fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
}));

describe('glob patterns tests', () => {
  describe('getIncludePatterns tests', () => {
    it('returns a default pattern when neither template nor include are specified', () => {
      const args = { template: '', include: '' };

      const result = getIncludePatterns(args);

      expect(result).toEqual(['**/*']);
    });

    it('returns a composite-action pattern when template is composite-action', () => {
      const args = { template: 'composite-action', include: '' };

      const result = getIncludePatterns(args);

      expect(result).toEqual(['action.{yml,yaml}', 'LICENSE', 'README{,.md}']);
    });

    it('returns a javascript-action pattern when template is javascript-action', () => {
      const args = { template: 'javascript-action', include: '' };

      const result = getIncludePatterns(args);

      expect(result).toEqual(['action.{yml,yaml}', 'dist/**', 'LICENSE', 'README{,.md}']);
    });

    it('throws an error when an invalid template is specified', () => {
      const args = { template: 'invalid-template', include: '' };

      expect(() => getIncludePatterns(args)).toThrowError("'invalid-template' is not a valid template");
    });

    it('returns a list of patterns when include is specified', () => {
      const args = {
        template: '',
        include: `
        README.md
        LICENSE
        
        src/**
        dist/

        !src/*.ts`,
      };

      const result = getIncludePatterns(args);

      expect(result).toEqual([
        'README.md',
        'LICENSE',
        'src/**',
        'dist/**',
        '!src/*.ts',
      ]);
    });

    it('extends the template with include patterns when both are specified', () => {
      const args = {
        template: 'javascript-action',
        include: `
        README.md
        !src/*.ts`,
      };

      const result = getIncludePatterns(args);

      expect(result).toEqual([
        'action.{yml,yaml}',
        'dist/**',
        'LICENSE',
        'README{,.md}',
        'README.md',
        '!src/*.ts',
      ]);
    });
  });

  describe('getExcludePatterns tests', () => {
    it('returns an empty array when no exclude is specified', async () => {
      const exclude = '';

      const result = await getExcludePatterns(exclude);

      expect(result).toEqual([]);
    });

    it('returns a list of patterns when exclude is specified', async () => {
      const exclude = `
        README.md
        LICENSE
        
        src/**
        dist/

        !src/*.ts`;

      const result = await getExcludePatterns(exclude);

      expect(result).toEqual([
        'README.md',
        'LICENSE',
        'src/**',
        'dist/**',
        '!src/*.ts',
      ]);
    });
  });
});
