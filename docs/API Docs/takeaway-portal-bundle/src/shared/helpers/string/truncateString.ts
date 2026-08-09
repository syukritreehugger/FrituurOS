export default (string: string, length = 30, end = '...'): string => {
    const regexp = new RegExp(`^(.{${length}})(.*)$`, 's');
    return string.replace(regexp, `$1${end}`);
};
