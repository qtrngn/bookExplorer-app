import AsyncStorage from "@react-native-async-storage/async-storage";

const BOOKS = "@MyBooks:books";


// get all the favorite books 
export const getFavorites = async () => {
    try {
        const favoritesList = await AsyncStorage.getItem(BOOKS);
        return favoritesList ? JSON.parse(favoritesList) : [];

        
    } catch (error) {
        console.error ('Cannot load the favorite list:', error);
        return []; 
    }
}

// add books to favorite list, if the books is already in the list, return to current list 
export const addFavorite = async (book) => {
    try {
        const favorites = await getFavorites();

        // check if book already existed
        if (!favorites.some(fav => fav.id === book.id)) {
            const updatedFavorites = [...favorites, book];
            await AsyncStorage.setItem(BOOKS, JSON.stringify(updatedFavorites));
            return updatedFavorites;
        }
        return favorites; 
    } catch  (error) {
        console.error('Add favorite fail:' ,error);
        throw error;
    }
}; 

// remove book from favorite 
export const removeFavorite = async (id) => {
    try {
        const favorites = await getFavorites(); 
        const updatedFavorites = favorites.filter(book => book.id !== id);
        await AsyncStorage.setItem(BOOKS, JSON.stringify(updatedFavorites));
        return updatedFavorites;
    } catch (error) {
        console.error ('Remove favorite book unsuccessfully:', error);
        throw error;
    }
}; 

