# Analyse de Correspondance : CPR0002783 et Preuves du Code

Ce document établit la correspondance entre les points clés de l'analyse du CPR0002783 et les preuves concrètes trouvées dans le code source du package `cscload_core_discount06`.

## 1. Logique d'identification des articles indisponibles à long terme

### 1.1 Articles sans stock

**Analyse :** Les articles dont la somme du stock (`sum(bestand)`) est égale à zéro sont considérés comme indisponibles.

**Preuve du code :** La logique est implémentée dans `ArticlesWithoutStockPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(ArticlesWithoutStockPreparer)
bool ArticlesWithoutStockPreparer::isExecutable() const
{
    return isContainedAndSet(properties::TARGET_TABLE_NAME.getName());
}
void ArticlesWithoutStockPreparer::buildSQLString()
{
    static const basar::VarString constSQL(
        "SELECT artikel_nr, sum(bestand) as sumBestand, sum(nachfrage) as sumNachfrage "
        "FROM " + tables::ARTIKEL_LOKAL + " "
        "GROUP BY artikel_nr "
        "HAVING sum(bestand) = 0 "
        "ORDER BY 3 desc "
        "INTO TEMP " + getPropertyList().getString(properties::TARGET_TABLE_NAME.getName()) + ";"
    );
    resolve( constSQL );
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}
```

### 1.2 Articles de substitution avec stock

**Analyse :** Les articles alternatifs qui ont du stock sont également pris en compte.

**Preuve du code :** La logique est implémentée dans `SubstitutionArticlesWithStockPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(SubstitutionArticlesWithStockPreparer)
bool SubstitutionArticlesWithStockPreparer::isExecutable() const
{
    return arePropertiesSet( properties::TARGET_TABLE_NAME.toPropertyString() +
                             properties::SOURCE_TABLE_NAME.toPropertyString());
}
void SubstitutionArticlesWithStockPreparer::buildSQLString()
{
    static const basar::VarString constSQL(
        "SELECT DISTINCT aa.artikel_nr, sum(al.bestand) as sumBestand "
        "FROM " + tables::ARTIKEL_ALTERNATIVE + " aa "
        "INNER JOIN " + tables::ARTIKEL_LOKAL + " al ON al.artikel_nr = aa.artikel_nr_altern "
        "WHERE aa.artikel_nr IN "
        "( SELECT d.artikel_nr FROM " + getPropertyList().getString(properties::SOURCE_TABLE_NAME.getName()) + " d ) "
        "GROUP BY aa.artikel_nr "
        "HAVING sum(al.bestand) > 0 "
        "INTO TEMP " + getPropertyList().getString(properties::TARGET_TABLE_NAME.getName()) + ";"
    );
    resolve(constSQL);
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}
```

### 1.3 Articles "pseudo"

**Analyse :** Certains articles avec des numéros de casier spécifiques (`lagerfachnr`) sont traités comme des articles "pseudo" et peuvent être exclus.

**Preuve du code :** La logique est implémentée dans `PseudoArticlesPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(PseudoArticlesPreparer)
bool PseudoArticlesPreparer::isExecutable() const
{
    return isContainedAndSet(properties::TARGET_TABLE_NAME.getName());
}
void PseudoArticlesPreparer::buildSQLString()
{
    static const basar::VarString constSQL(
        "SELECT DISTINCT artikel_nr "
        "FROM " + tables::ARTIKEL_LOKAL + " "
        "WHERE lagerfachnr in( \'99999999\', \'09999999\', \'98000000\', \'99000000\', \'32000000\' ) "
        "AND filialnr != 27 "
        "INTO TEMP " + getPropertyList().getString(properties::TARGET_TABLE_NAME.getName()) + ";"
    );
    resolve(constSQL);
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}
```

### 1.4 Articles avec tag d'activation

**Analyse :** Les articles avec un tag d'activation spécifique (`artikelaktiv`) sont également considérés.

**Preuve du code :** La logique est implémentée dans `ArticlesWithActivationTagPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(ArticlesWithActivationTagPreparer)
bool ArticlesWithActivationTagPreparer::isExecutable() const
{
    return arePropertiesSet( properties::TARGET_TABLE_NAME.toPropertyString() +
                             properties::ARTICLE_ACTIVE_TAG.toPropertyString());
}
void ArticlesWithActivationTagPreparer::buildSQLString()
{
    static const basar::VarString constSQL(
        "SELECT DISTINCT artikel_nr "
        "FROM " + tables::ARTIKEL_LOKAL + " "
        "WHERE artikelaktiv = " + properties::ARTICLE_ACTIVE_TAG.toSQLReplacementString() + " "
        "INTO TEMP " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + ";"
    );
    resolve( constSQL );
    BLOG_TRACE( longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString() );
}
```

### 1.5 Articles réimportés

**Analyse :** Les articles réimportés avec un statut actif (`kzaktivpassiv = 1`) sont également traités.

**Preuve du code :** La logique est implémentée dans `ArticlesReImportPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(ArticlesReImportPreparer)
bool ArticlesReImportPreparer::isExecutable() const
{
    return isContainedAndSet(properties::TARGET_TABLE_NAME.getName());
}
void ArticlesReImportPreparer::buildSQLString()
{
    static const basar::VarString constSQL(
        "SELECT distinct artikel_nr "
        "FROM " + tables::ARTIKEL_REIMPORT + " "
        "WHERE kzaktivpassiv = 1 "
        "INTO TEMP " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + ";"
    );
    resolve(constSQL);
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}
```

### 1.6 Articles réservés

**Analyse :** Les articles ayant une quantité réservée (`reservedqty > 0`) et un type de réservation spécifique (`reservtype = 0` ou `reservtype = 2`) sont également pris en compte.

**Preuve du code :** La logique est implémentée dans `ReservedArticlesPreparer`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(ReservedArticlesPreparer)
bool ReservedArticlesPreparer::isExecutable() const
{
    return isContainedAndSet(properties::TARGET_TABLE_NAME.getName());
}
void ReservedArticlesPreparer::buildSQLString()
{
    static const basar::VarString constSelectSQL(
        "SELECT DISTINCT articleno as artikel_nr "
        "FROM  " + tables::ARTICLE_RESERVATION + " "
        "WHERE " 
    );
    basar::VarString whereClauseSQL("reservedqty > 0 ");
    if (isContainedAndSet(properties::WITH_ARTICLE_RESERVATION_TYPE.getName()))
    {
        if (1 == getPropertyList().getInt16(properties::WITH_ARTICLE_RESERVATION_TYPE.getName()))
        {
            whereClauseSQL = "   ( reservtype = 0 AND reservepct = 100 AND " + whereClauseSQL + ") " +
                             "OR ( reservtype = 2 AND " + whereClauseSQL + ") ";
        }
    }
    static const basar::VarString constIntoSQL( "INTO TEMP " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + ";" );
    resolve( constSelectSQL + whereClauseSQL + constIntoSQL);
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}
```

## 2. Impact sur la logique métier (`isLongTermLack`)

**Analyse :** La fonction `isLongTermLack` est utilisée pour vérifier si un article est indisponible à long terme, ce qui a un impact direct sur la gestion des commandes.

**Preuve du code :** L'utilisation de `isLongTermLack` est visible dans `itmstock.cpp`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/ph.out.csc_core_apps_initial_bef_cpr/dev/src/pxverbund/libsrc/itmstock.cpp

    try
    {
        longTermLack = Session()->getStockBookingComponentManager()->getLongTermLackChecker()->isLongTermLack(ArtikelNr_);
    }
    catch (...)
    {
        return longTermLack;
    }
    if (true == longTermLack)
    {
        MengeBestellt_ = QOrdered;
        FehlerMenge_ |= QStateNotOnHand;
```

## 3. Gestion de la table `longtermlack`

**Analyse :** La table `longtermlack` est gérée par des opérations d'insertion et de suppression.

**Preuve du code :** Les opérations sont définies dans `longtermlacksqlmapper.cpp` et `longtermlackacc.cpp`.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/ph.out.csc_core_apps_initial_bef_cpr/dev/src/libcsc/stockbooking/longtermlack/longtermlacksqlmapper.cpp

const basar::VarString LongTermLackSQLMapper::getDeleteSQL( const basar::Int32 articleNo )
{
    LOG4CPLUS_TRACE_METHOD(libcsc::LoggerPool::getLoggerStockBooking(), "LongTermLackSQLMapper::getDeleteSQL()");

    std::stringstream sql;
    sql << "DELETE FROM longtermlack WHERE articleno = " << articleNo << ";";
    return sql.str();
}

const basar::VarString LongTermLackSQLMapper::getSelectSQL()
{
    LOG4CPLUS_TRACE_METHOD(libcsc::LoggerPool::getLoggerStockBooking(), "LongTermLackSQLMapper::getSelectSQL()");

    std::stringstream sql;
    sql << "SELECT count(*) AS " << s_NumberOfLacksColumn.c_str() << " from longtermlack WHERE articleno = ? and enabled > " << LongTermLackArticle::ARTICLE_UNPROCESSIBLE << ";";
        
    return sql.str();
}
```

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/pharmos.outbound.csc_load_-_initial_before_cpr/dev/src/longtermlackloader/infrastructure/accessor/longtermlackpgk/longtermlackacc.cpp

BUILDER_DEFINITION(LongTermLackEraser)
bool LongTermLackEraser::isExecutable() const
{
    return arePropertiesSet(properties::TARGET_TABLE_NAME.toPropertyString() +
                            properties::PERSISTENCE_STRATEGY.toPropertyString());
}
void LongTermLackEraser::buildSQLString()
{
    if (libutil::flag::INT_FLAG_ON == getPropertyList().getInt16(properties::PERSISTENCE_STRATEGY.getName()))
    {
        static const basar::VarString constSQL(
            "TRUNCATE TABLE " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + "; "
        );
        resolve(constSQL);
        return;
    }
    static const basar::VarString constSQL(
        "DELETE FROM " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + " "
        "WHERE articleno NOT IN "
        "( SELECT artikel_nr "
        "  FROM " + properties::SOURCE_TABLE_NAME.toSQLReplacementString() +
        " );"
    );
    
    resolve(constSQL);
    BLOG_TRACE(longtermlackloader::infrastructure::LoggerPool::getLoggerDebugOutput(), getSQLString());
}

BUILDER_DEFINITION(LongTermLackInserter)
bool LongTermLackInserter::isExecutable() const
{
    return arePropertiesSet(properties::TARGET_TABLE_NAME.toPropertyString() +
                            properties::SOURCE_TABLE_NAME.toPropertyString());
}
void LongTermLackInserter::buildSQLString()
{
    static const basar::VarString constSQL(
        "INSERT INTO " + properties::TARGET_TABLE_NAME.toSQLReplacementString() + " (articleno, messagecode, enabled) "
        "   SELECT artikel_nr, 0, 1 "
        "   FROM " + properties::SOURCE_TABLE_NAME.toSQLReplacementString()
    );
    if (libutil::flag::INT_FLAG_ON == getPropertyList().getInt16(properties::PERSISTENCE_STRATEGY.getName()))
    {
        resolve( constSQL + ";" );
```

## 4. Spécificités France

**Analyse :** Le code contient des références à la France, indiquant une gestion spécifique par pays.

**Preuve du code :** Des constantes et des fonctions de gestion de pays sont présentes.

```cpp
// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/ph.out.csc_core_apps_initial_bef_cpr/dev/src/pxverbund/include/pxsess.hpp
		static const char* COUNTRY_FRANCE_PREWHOLE;
		static const char* COUNTRY_FRANCE;

// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/ph.out.csc_core_apps_initial_bef_cpr/dev/src/pxverbund/libsrc/session.cpp
const char* pxSession::COUNTRY_FRANCE           = "FR";
const char* pxSession::COUNTRY_FRANCE_PREWHOLE  = "PF";
    if( pxSession::COUNTRY_FRANCE == m_SessionInitialization.getCountryCode() )
    if( pxSession::COUNTRY_FRANCE_PREWHOLE == m_SessionInitialization.getCountryCode() )

// Fichier: /home/ubuntu/cscload_core_discount06/SOURCES/ph.out.csc_core_apps_initial_bef_cpr/dev/src/csc_deli/libcsc_deli/infrastructure/parameter/areamapper.cpp
            m_CountryCodes[ "FR"  ] = FRANCE;
```

## Références :

[1] `CPR0002783 - Analysis Details - NTTD.doc`
[2] `CPR0002783 - INT - trace long-term unavailable products.doc`
[3] `https://github.com/haythem-dev/cscload_core_discount06/tree/main/SOURCES/ph.out.csc_core_apps_initial_bef_cpr` (Dépôt GitHub du code source impacté)
