
/**
 * Coin namespace
 * made by me
 */
export namespace Coin {
    export interface Coin {
        data: string,
        x: number,
        y: number
    }

    export async function createCoinFromSvgFile(path: string, x: number, y: number): Promise<Coin> {
        try {
            const response = await fetch(path); // Use the provided path parameter
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.statusText}`);
            }
            const text = await response.text();
            return {
                data: text,
                x: x,
                y: y
            };
        } catch (error) {
            console.error("Error creating coin from SVG file:", error);
            throw error; // Rethrow the error for further handling
        }
    }
}

export default Coin;
