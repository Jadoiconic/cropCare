import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';

const Discover = () => {
    const resources = [
        {
            title: 'Ikigo cy’Igihugu gishinzwe Iterambere ry’Ubuhinzi n’Ubworozi (RAB)',
            link: 'https://www.rab.gov.rw',
            description: 'Shyikira amakuru agezweho, ubushakashatsi, n’amabwiriza y’ubuhinzi harimo n\'uburyo bwo guhangana n’indwara n’ibyonnyi by’ibihingwa nk’ibirayi n’ibigori.',
        },
        {
            title: 'MINAGRI (Ministeri y\'Ubuhinzi n\'Ubworozi)',
            link: 'http://www.minagri.gov.rw',
            description: 'Urubuga rwemewe rutanga politike, gahunda, n\'ibikoresho byerekeranye n\'ubuhinzi mu Rwanda.',
        },
        {
            title: 'Amakuru y\'Ikirere',
            link: 'https://www.meteorwanda.gov.rw',
            description: 'Shyikira amakuru y\'ikirere mu gihe nyacyo n\'ibiteganyijwe, ugategura neza igihe cyo gutera, kuvomerera, no gusarura.',
        },
        {
            title: 'Amashyirahamwe y’Abahinzi (urugero, Rwanda Farmers Coffee Cooperative)',
            link: 'https://www.rwandafarmerscoffees.org',
            description: 'Urubuga ruhuza abahinzi bakungurana inama, by’umwihariko ku bijyanye n’isoko rusange no gukoresha uburyo bwiza bwo guhinga.',
        },
        {
            title: 'Urubuga rwa e-Soko',
            link: 'https://www.esoko.com/rwanda',
            description: 'Igenzure ibiciro by\'isoko by\'ibihingwa nka ibigori n\'ibirayi, bitume ufata ibyemezo bishingiye ku makuru yo kugurisha.',
        },
        {
            title: 'Serivisi z’Inama ku Buhinzi (Twigire Muhinzi)',
            link: 'http://www.minagri.gov.rw/index.php?id=119',
            description: 'Soma ku buryo bwa Twigire Muhinzi, itanga inama n’ubufasha ku bahinzi bo mu Rwanda.',
        },
        {
            title: 'Ikigo cy’Ubucuruzi bw’Ubuhinzi mu Rwanda (Rwanda Trading Company - RTC)',
            link: 'http://www.rwandatradingcompany.com',
            description: 'Shyikira amakuru y\'ibyerekeranye no kugurisha cyangwa kohereza ibicuruzwa by’ubuhinzi hanze nka ibigori n’ibirayi.',
        },
        {
            title: 'One Acre Fund Rwanda',
            link: 'https://oneacrefund.org/rwanda',
            description: 'Umuryango utera inkunga abahinzi bato, ubaha inguzanyo, imbuto, n’amahugurwa agamije kongera umusaruro wabo mu buhinzi.',
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Shakisha</Text>
                <Text style={styles.subtitle}>
                    Dore zimwe mu mbuga zafasha abahinzi mu Rwanda :
                </Text>
                {resources.map((resource, index) => (
                    <View key={index} style={styles.resourceContainer}>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                        <Text style={styles.resourceDescription}>{resource.description}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(resource.link)} style={styles.button}>
                            <Text style={styles.buttonText}>Sura Urubuga</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Discover;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 20,
    },
    resourceContainer: {
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 5,
    },
    resourceDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#27ae60',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
