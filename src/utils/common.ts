export const isValidPublishingYear = (publishing_year: any): boolean => {
    const year = parseInt(publishing_year, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1000 && year <= currentYear;
};

export const getPaginationOptions = (
    pageIndex: any,
    pageSize: any,
    defaultPageSize: number = 10,
    defaultPageIndex: number = 1
) => {
    const page = parseInt(pageIndex, 10);
    const size = parseInt(pageSize, 10);

    // Default values if pageIndex or pageSize are invalid
    const validPage = !isNaN(page) && page > 0 ? page : defaultPageIndex;
    const validSize = !isNaN(size) && size > 0 ? size : defaultPageSize;

    // Calculate offset and limit
    const offset = (validPage - 1) * validSize;

    return {
        limit: validSize,
        offset: offset
    };
};
