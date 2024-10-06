import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';

const Maize = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredContent, setFilteredContent] = useState('');

    const content = `
        Uburyo bwo Kuvomerera no Kuhira Ibigori mu Rwanda Hagendewe ku Mabwiriza ya RAB
        
        Kuhira ibigori ni ingenzi cyane kugira ngo birusheho kwera neza, cyane cyane mu bice cyangwa mu bihe bidafite imvura ihagije. Mu Rwanda, aho imvura ishobora kuba nkeya mu turere tumwe na tumwe, kuvomerera no kuhira bituma ibigori byihaza mu mazi bigomba kubona mu byiciro bitandukanye by’imikurire. Dore uko wabigenza neza ngo wuhire ibigori byawe hakurikijwe ibyo RAB igira inama.

        1. Amazi Ibigori Bikenera

        Ibigori bikenera mili-metero 500-800 z’imvura mu gihe cyose cyo gukura, bitewe n’ubwoko bw’ibigori ndetse n’imiterere y’ikirere. Amazi ahagije akeneye cyane mu gihe cyo kwerekana imbuto (kanda), n’igice cyo gushyira imburamumero (gutanga imbuto). Muri ibi byiciro, ibigori biba bikeneye amazi cyane kurusha ibindi bihe byose.

        Amazi akenerwa mu byiciro by’imikurire:

        Gutera kugeza igihe bimeze neza (iminsi 0-45): Ibihe bya mbere bifata amazi yoroheje, ariko agomba kuba ahagije kugira ngo imizi ikure neza.

        Igihe cyo kugaragaza imbuto (iminsi 45-70): Ni cyo gihe cy’ingenzi cyane, aho ibigori bikenera amazi menshi cyane. Kutabona amazi ahagije muri iki gihe bishobora kugabanya cyane umusaruro.

        Gushyira imbuto ku ntoki (iminsi 70-100): Ibigori bigikeneye amazi kugira ngo imbuto zitagabanya ingano. Amazi make muri iki gihe bishobora gutuma imbuto zigira ubusa.

        Kujya ku musaruro (iminsi 100-130): Amazi make arakenewe kuko ibigori biba bitangiye kumera, kandi amazi menshi cyane muri iki gihe bishobora gutera ibibazo mu bisarurwa.

        2. Uburyo bwo Kuvomerera Ibigori

        a. Uburyo bwo Kuvomerera mu mirongo (Flood Irrigation): Aha, urimo kumena amazi mu mirongo iri hagati y'imirima y'ibigori.

        Ibyiza: Uburyo busanzwe bworoshye ku bahinzi bato.

        Ibibazo: Bukoresha amazi menshi kandi bushobora guteza ikibazo cyo gutemba kw’amazi, gutakaza intungamubiri mu butaka no kwangiza imizi y’ibigori kubera kurengerwa.

        b. Kuvomerera hakoreshejwe imirongo y’amazi (Furrow Irrigation): Aha amazi atemba mu mirongo iri hagati y’imirongo y’ibigori, maze akinjira mu butaka buherereye ku mizi y'ibigori.

        Ibyiza: Amazi akwirakwira neza kandi akagera aho akeneye kugera ku gihingwa.

        Ibibazo: Iyo imirima ifite ubusumbane mu butaka, amazi atagwa neza ashobora gutakara cyangwa guhambira umusozi wose, bigatuma amazi aba macye ku bindi bice.

        c. Kuhira hakoreshejwe uburyo bwa Drip Irrigation: Drip irrigation yohereza amazi ku mizi y’ibigori hakoreshejwe imiyoboro mito (drip lines).

        Ibyiza: Amazi akora neza ku bigori, nta kuyangiza. Birinda umucanga n’ubushyuhe bukabije mu butaka. Amazi make akoreshwa neza.

        Ibibazo: Gushyiraho imiyoboro mito birahenda mu ntangiriro, ariko bifite akamaro mu gihe kirekire ku bahinzi bafite umurima munini.

        d. Kuvomerera hakoreshejwe ibyuma bihungira amazi (Sprinkler Irrigation): Aha amazi amenwa hejuru, maze akagera ku bihingwa byose nk’uko imvura iba igwa ku murima wose.

        Ibyiza: Bukora neza kandi bworohera ahantu hafite ubuso bunini.

        Ibibazo: Iyo hari umuyaga ukomeye, amazi ashobora kuguruka ntakwire neza, ndetse ubushyuhe bukabije bushobora gutuma amazi ahita akama mu kirere.

        3. Imigenzo yo Kuhira Ibigori

        Igihe cyo Kuhira:

        Ku ntangiriro (ibyumweru 2-3 bya mbere): Wuhira buri minsi 7-10, kugira ngo umizi ikure neza. Kwihutisha kuhira muri iki gihe bishobora gutuma igihingwa kidakura neza.

        Mu gihe cyo gukura (iminsi 45-70): Kuhira buri minsi 5-7 bitewe n’uko imvura ihagaze.

        Igihe cyo gusohora imbuto (iminsi 70-100): Wuhira cyane, buri minsi 3-5, kuko iki ari cyo gihe cy'ingenzi cyane aho igihingwa gikenera amazi menshi.

        Igihe cyo gusarura (iminsi 100-130): Gabaniriza amazi cyangwa ureke kuhira burundu, cyane cyane igihe igihingwa kigeze hafi yo gusarurwa.

        4. Ibyiza byo Kuvomerera Neza Ibigori

        Kubungabunga amazi: Igena amazi ukoresheje neza amazi, kugira ngo wirinde kwangiza ubutaka cyangwa gutakaza amazi mu buryo budakenewe.

        Mulching: Tekereza gushyira ibyatsi cyangwa ibishingwe ku butaka kugira ngo wifashe kubungabunga amazi kandi wirinde umuyaga utwara ubutaka.

        Umwanzuro

        Kuhira ibigori ni ingenzi mu kurinda umusaruro wawe kandi bigufasha kubona umusaruro mwinshi. Bifite akamaro kenshi cyane cyane mu bice bitagira imvura ihagije cyangwa mu gihe cy’izuba. Ushobora guhitamo uburyo bukwiriye bitewe n'ibikoresho n'amafaranga ufite, ariko byose bigomba gukorwa neza kugira ngo umusaruro w'ibigori wawe wiyongere.
    `;

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = content
            .split('\n')
            .filter(line => line.toLowerCase().includes(query.toLowerCase()))
            .join('\n');
        setFilteredContent(filtered || 'Nta bisobanuro bihari bijyanye n\'ibyo washyizemo.');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Shakisha hano..."
                value={searchQuery}
                onChangeText={handleSearch}
            />
            <ScrollView>
                <Text style={styles.title}>Uburyo bwo Kuvomerera no Kuhira Ibigori</Text>
                <Text style={styles.content}>
                    {searchQuery ? filteredContent : content}
                </Text>
            </ScrollView>

        </View>
    );
};

export default Maize;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    searchBar: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    content: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
