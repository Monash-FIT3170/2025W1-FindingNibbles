import os
import time
import requests
PIXABAY_API_KEY = "51922748-eb6018f67117f62339ea27f62"  # Replace with your API key

# JSON of cities and dishes
cities_dishes = {
    "Mumbai": ["Vada Pav", "Pav Bhaji", "Bhel Puri", "Pani Puri", "Butter Chicken", "Chicken Biryani", "Bombay Sandwich", "Dabeli", "Frankie Roll", "Sev Puri"],
    "Rome": ["Pizza al Taglio", "Carbonara", "Cacio e Pepe", "Supplì", "Saltimbocca", "Gelato", "Porchetta", "Gnocchi alla Romana", "Tiramisu", "Amatriciana"],
    "Beijing": ["Peking Duck", "Jianbing", "Hot Pot", "Zha Jiang Mian", "Baozi", "Kung Pao Chicken", "Mooncake", "Mongolian Hot Pot", "Spring Rolls", "Dim Sum"],
    "Istanbul": ["Doner Kebab", "Baklava", "Lahmacun", "Menemen", "Kofte", "Turkish Delight", "Meze", "Simit", "Manti", "Iskender Kebab"],
    "Mexico City": ["Tacos al Pastor", "Tamales", "Quesadillas", "Chiles en Nogada", "Pozole", "Elote", "Tostadas", "Mole Poblano", "Barbacoa", "Churros"],
    "London": ["Fish and Chips", "Full English Breakfast", "Sunday Roast", "Shepherd's Pie", "Chicken Tikka Masala", "Scotch Egg", "Beef Wellington", "Victoria Sponge", "Sticky Toffee Pudding", "Cornish Pasty"],
    "Barcelona": ["Paella", "Patatas Bravas", "Tapas", "Fideuà", "Crema Catalana", "Escalivada", "Cava", "Bikini Sandwich", "Bombas", "Esqueixada"],
    "Seoul": ["Kimchi", "Bibimbap", "Bulgogi", "Tteokbokki", "Samgyeopsal", "Japchae", "Hotteok", "Naengmyeon", "Kimbap", "Sundubu-jjigae"],
    "Hong Kong": ["Dim Sum", "Char Siu", "Wonton Noodles", "Egg Tarts", "Claypot Rice", "Roast Goose", "Pineapple Bun", "Milk Tea", "Cheung Fun", "Hot Pot"],
    "Singapore": ["Hainanese Chicken Rice", "Chilli Crab", "Laksa", "Satay", "Char Kway Teow", "Kaya Toast", "Nasi Lemak", "Fish Head Curry", "Popiah", "Carrot Cake (Savory)"],
    "Cairo": ["Koshari", "Falafel (Ta'ameya)", "Shawarma", "Mahshi", "Molokhia", "Fattah", "Ful Medames", "Basbousa", "Kunafa", "Roz Bel Laban"],
    "Lima": ["Ceviche", "Lomo Saltado", "Aji de Gallina", "Anticuchos", "Papa a la Huancaína", "Rocoto Relleno", "Tacu Tacu", "Chifa (Peruvian-Chinese Fried Rice)", "Causa Rellena", "Picarones"],
    "Athens": ["Moussaka", "Souvlaki", "Gyro", "Spanakopita", "Dolmades", "Baklava", "Taramasalata", "Fasolada", "Kleftiko", "Loukoumades"],
    "Berlin": ["Currywurst", "Döner Kebab", "Berliner Pfannkuchen", "Kartoffelsalat", "Schnitzel", "Pretzel", "Bratwurst", "Spätzle", "Eisbein", "Apfelstrudel"],
    "Sydney": ["Meat Pie", "Lamingtons", "Pavlova", "Vegemite Toast", "Barramundi", "Sausage Sizzle", "Fairy Bread", "Anzac Biscuits", "Chicken Parmigiana", "Flat White"],
    "Buenos Aires": ["Asado", "Empanadas", "Milanesa", "Provoleta", "Choripán", "Fugazzeta Pizza", "Matambre", "Locro", "Dulce de Leche", "Alfajores"],
    "Marrakech": ["Tagine", "Couscous", "Pastilla", "Harira", "Mechoui", "Zaalouk", "Rfissa", "Chebakia", "Khobz", "Briouat"],
    "Hanoi": ["Pho", "Banh Mi", "Bun Cha", "Cha Ca", "Nem Ran (Spring Rolls)", "Xoi", "Egg Coffee", "Bun Bo Nam Bo", "Goi Cuon", "Che"],
    "Dubai": ["Shawarma", "Harees", "Machboos", "Luqaimat", "Stuffed Camel", "Falafel", "Tabbouleh", "Knafeh", "Samak Mashwi", "Balaleet"],
    "Moscow": ["Borscht", "Pelmeni", "Beef Stroganoff", "Olivier Salad", "Blini", "Pirozhki", "Shashlik", "Kvass", "Vareniki", "Caviar"],
    "Rio de Janeiro": ["Feijoada", "Coxinha", "Pão de Queijo", "Moqueca", "Brigadeiro", "Acarajé", "Pastel", "Churrasco", "Vatapá", "Tapioca Pancakes"],
    "Bangladesh (Dhaka)": ["Hilsa Curry", "Kacchi Biryani", "Fuchka", "Bhuna Khichuri", "Shutki Maach", "Chingri Malai Curry", "Shingara", "Pitha", "Beef Rezala", "Morog Polao"],
    "Tehran": ["Chelo Kebab", "Ghormeh Sabzi", "Fesenjan", "Tahdig", "Ash Reshteh", "Baghali Polo", "Zereshk Polo", "Dizi", "Shirin Polo", "Saffron Ice Cream"],
    "Cape Town": ["Bobotie", "Bunny Chow", "Gatsby Sandwich", "Koeksisters", "Boerewors", "Sosaties", "Milk Tart", "Snoek Braai", "Chakalaka", "Melktert"],
    "Los Angeles": ["Fish Tacos", "Avocado Toast", "Korean BBQ", "French Dip Sandwich", "California Roll", "Cobb Salad", "In-N-Out Burger", "Cioppino", "Chili Dog", "Donuts"],
    "Chicago": ["Deep Dish Pizza", "Italian Beef Sandwich", "Chicago-style Hot Dog", "Popcorn (Garrett)", "Polish Sausage", "Jibarito Sandwich", "Maxwell Street Polish", "Rainbow Cone", "Shrimp DeJonghe", "Chicken Vesuvio"],
    "San Francisco": ["Cioppino", "Sourdough Bread", "Mission Burrito", "Dungeness Crab", "Hangtown Fry", "Clam Chowder (in Bread Bowl)", "Ghirardelli Chocolate", "Dim Sum", "Green Goddess Dressing", "Irish Coffee"],
    "Toronto": ["Peameal Bacon Sandwich", "Butter Tart", "Poutine", "Nanaimo Bar", "Roti", "Bagels (Montreal-style)", "Ketchup Chips", "Jerk Chicken", "BeaverTails", "Persian"],
    "Montreal": ["Poutine", "Montreal-style Bagel", "Smoked Meat Sandwich", "Tourtière", "Cretons", "Maple Taffy", "Steamé Hot Dog", "Pouding Chômeur", "Soupe aux Pois", "BeaverTail"],
    "Madrid": ["Tortilla Española", "Bocadillo de Calamares", "Churros con Chocolate", "Cocido Madrileño", "Callos a la Madrileña", "Oreja a la Plancha", "Huevos Rotos", "Leche Frita", "Sobrassada", "Pisto"],
    "Naples": ["Neapolitan Pizza", "Spaghetti alle Vongole", "Sfogliatella", "Parmigiana di Melanzane", "Zeppole", "Struffoli", "Limoncello", "Ragù Napoletano", "Polpette", "Pastiera"],
    "Florence": ["Bistecca alla Fiorentina", "Lampredotto", "Ribollita", "Pappa al Pomodoro", "Cantucci", "Crostini Toscani", "Trippa alla Fiorentina", "Castagnaccio", "Vin Santo", "Panforte"],
    "Venice": ["Sarde in Saor", "Risotto al Nero di Seppia", "Bigoli in Salsa", "Fegato alla Veneziana", "Moeche", "Tiramisu", "Spritz", "Cicchetti", "Polenta e Schie", "Baicoli"],
    "Lisbon": ["Bacalhau à Brás", "Sardinhas Assadas", "Caldo Verde", "Bifana", "Pastéis de Nata", "Amêijoas à Bulhão Pato", "Francesinha", "Arroz de Marisco", "Polvo à Lagareiro", "Alheira"],
    "Edinburgh": ["Haggis", "Scotch Pie", "Cullen Skink", "Shortbread", "Tablet", "Black Pudding", "Neeps and Tatties", "Scotch Broth", "Arbroath Smokie", "Cranachan"],
    "Dublin": ["Irish Stew", "Boxty", "Coddle", "Colcannon", "Soda Bread", "Black Pudding", "White Pudding", "Seafood Chowder", "Barmbrack", "Guinness Pie"],
    "Brussels": ["Belgian Waffles", "Moules-frites", "Stoofvlees", "Speculoos", "Waterzooi", "Filet Américain", "Endives au Gratin", "Chocolate Pralines", "Frites", "Sirop de Liège"],
    "Vienna": ["Wiener Schnitzel", "Sachertorte", "Apfelstrudel", "Tafelspitz", "Knödel", "Gulasch", "Kardinalschnitten", "Palatschinken", "Topfenstrudel", "Kipferl"],
    "Prague": ["Svíčková", "Goulash", "Trdelník", "Knedlíky", "Vepřo Knedlo Zelo", "Chlebíčky", "Koláče", "Fried Cheese", "Bramboráky", "Moravian Sparrow"],
    "Warsaw": ["Pierogi", "Bigos", "Żurek", "Kotlet Schabowy", "Placki Ziemniaczane", "Gołąbki", "Kiełbasa", "Makowiec", "Pączki", "Rosół"],
    "Stockholm": ["Swedish Meatballs", "Gravlax", "Surströmming", "Prinsesstårta", "Raggmunk", "Kanelbullar", "Smörgåsbord", "Toast Skagen", "Semla", "Ärtsoppa"],
    "Copenhagen": ["Smørrebrød", "Frikadeller", "Stegt Flæsk", "Æbleskiver", "Flæskesteg", "Leverpostej", "Rødgrød med Fløde", "Koldskål", "Rugbrød", "Kransekage"],
    "Oslo": ["Rakfisk", "Kjøttkaker", "Lutefisk", "Pinnekjøtt", "Fårikål", "Rømmegrøt", "Krumkake", "Sursild", "Koldtbord", "Brunost"],
    "Helsinki": ["Karjalanpiirakka", "Kalakukko", "Lohikeitto", "Poronkäristys", "Runeberg Torte", "Mustikkapiirakka", "Ruisleipä", "Graavilohi", "Salmiakki", "Leipäjuusto"],
    "Reykjavik": ["Hakarl", "Lamb Hot Dog", "Plokkfiskur", "Skyr", "Kleinur", "Hangikjöt", "Rúgbrauð", "Pönnukökur", "Harðfiskur", "Brennivín"],
    "Jakarta": ["Nasi Goreng", "Satay", "Gado-Gado", "Soto Betawi", "Rendang", "Bakso", "Martabak", "Ayam Goreng", "Pempek", "Kerak Telor"],
    "Kuala Lumpur": ["Nasi Lemak", "Roti Canai", "Char Kway Teow", "Hokkien Mee", "Satay", "Banana Leaf Rice", "Laksa", "Teh Tarik", "Cendol", "Mee Goreng"],
    "Manila": ["Adobo", "Sinigang", "Lechon", "Kare-Kare", "Halo-Halo", "Pancit Canton", "Sisig", "Lumpia", "Bicol Express", "Tosilog"],
    "Havana": ["Ropa Vieja", "Picadillo", "Arroz con Pollo", "Yuca con Mojo", "Lechon Asado", "Tostones", "Vaca Frita", "Croquetas", "Flan Cubano", "Malanga Fritters"],
    "Santiago": ["Pastel de Choclo", "Empanadas de Pino", "Curanto", "Cazuela", "Completo", "Humitas", "Porotos Granados", "Mote con Huesillo", "Reineta a la Plancha", "Sopaipillas"],
    "Bogotá": ["Ajiaco", "Bandeja Paisa", "Arepas", "Changua", "Tamales Tolimenses", "Lechona", "Hormiga Culona", "Sancocho", "Empanadas", "Posta Negra"],
    "Caracas": ["Arepas", "Pabellón Criollo", "Hallaca", "Cachapa", "Tequeños", "Asado Negro", "Perico", "Pan de Jamón", "Mandocas", "Quesillo"],
    "Lagos": ["Jollof Rice", "Suya", "Puff-Puff", "Moi Moi", "Egusi Soup", "Akara", "Pepper Soup", "Ofada Rice", "Kilishi", "Efo Riro"],
    "Accra": ["Waakye", "Jollof Rice", "Banku", "Kenkey", "Fufu", "Kelewele", "Groundnut Soup", "Tuo Zaafi", "Shito", "Red Red"],
    "Nairobi": ["Nyama Choma", "Ugali", "Sukuma Wiki", "Mandazi", "Mutura", "Chapati", "Githeri", "Kachumbari", "Irio", "Pilau"],
    "Addis Ababa": ["Injera", "Doro Wat", "Kitfo", "Shiro Wat", "Tibs", "Firfir", "Genfo", "Beyaynetu", "Chechebsa", "Tej"]
}

# Base folder to save images
base_folder = r"C:\Users\arnav\OneDrive\Desktop\2025W1-FindingNibbles\finding-nibbles-ts\public\images\dishes"

# -------------------- FUNCTION --------------------
def download_image(url, path):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(path, "wb") as f:
                f.write(response.content)
            print(f"Downloaded: {path}")
        else:
            print(f"Failed to download: {url}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

# -------------------- MAIN --------------------
for city, dishes in cities_dishes.items():
    city_folder = os.path.join(base_folder, city)
    os.makedirs(city_folder, exist_ok=True)
    
    for dish in dishes:
        # Pixabay API search
        query = f"{dish} food"
        api_url = f"https://pixabay.com/api/?key={PIXABAY_API_KEY}&q={requests.utils.quote(query)}&image_type=photo&per_page=3"
        
        try:
            response = requests.get(api_url, timeout=10).json()
            if response['hits']:
                img_url = response['hits'][0]['largeImageURL']
                # Replace spaces with underscores and also handle slashes
                safe_name = dish.replace(" ", "_").replace("/", "_")
                file_name = f"{safe_name}.png"
                file_path = os.path.join(city_folder, file_name)
                download_image(img_url, file_path)
            else:
                print(f"No image found for: {dish}")
        except Exception as e:
            print(f"Error fetching image for {dish}: {e}")
        
        time.sleep(0.5)  # polite delay to avoid hitting API rate limi