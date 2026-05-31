const { marked } = require('marked');
const hljs = require('highlight.js');

marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    gfm: true,
    breaks: true
});

function renderMarkdown(content) {
    return marked.parse(content);
}

function renderExcerpt(content) {
    return content.replace(/[#*`>\-\[\]]/g, '').slice(0, 150) + '...';
}

module.exports = { renderMarkdown, renderExcerpt };