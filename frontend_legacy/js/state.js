export const state = {
    currentModelId: null,
    editor: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentMesh: null,
    selectedExportFormat: 'stl',
    editorLoading: false,
    examplesData: { examples: [], categories: [] },
    currentCategory: 'all',
    selectedExample: null,
};
