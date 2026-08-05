import cleanup from 'rollup-plugin-cleanup';

export default {
    input: 'src/index.js',
    plugins: [cleanup()],
    output: [
        {
            file: 'dist/cursed_fw.js',
            format: 'esm',
        }
    ]
}
