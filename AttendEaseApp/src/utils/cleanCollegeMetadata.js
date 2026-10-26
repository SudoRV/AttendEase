export default function clean(str) {
    if (!str) return "";
    return String(str).replace(/[^a-zA-Z0-9-_~%]/g, "");
}