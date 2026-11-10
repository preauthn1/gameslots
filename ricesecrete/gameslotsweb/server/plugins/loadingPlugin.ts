export default defineNitroPlugin(nitroApp => {
    nitroApp.hooks.hook('render:html', (html, { event }) => {
        html.bodyPrepend.push('<div class="loading-overlay"><div class="loading-spinner"></div></div>');
    });
});