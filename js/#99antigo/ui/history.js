export function saveHistory(msg) {
    const list = JSON.parse(localStorage.getItem('iso-history') || '[]');
    list.unshift(msg);
    localStorage.setItem('iso-history', JSON.stringify(list.slice(0, 50)));
}
