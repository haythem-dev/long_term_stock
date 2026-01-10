# Analysis Report: CPR0002783 - Trace Long-term Unavailable Products

## Overview
This analysis covers the transition and tracing of long-term unavailable products within the CSC (Core Service Components) system. The project involves a complex C++ and C# ecosystem primarily focused on order processing, delivery advices, and host interfaces.

## CPR Description (CPR0002783)
- **Goal**: Implement tracing for products that are unavailable for extended periods.
- **Context**: The system needs to identify and handle scenarios where articles cannot be fulfilled over a significant time horizon.
- **Impact**: Affects order import (`ibtorderimport`), order closing (`aaorderclose`), and the central server (`kscserver`).

## Source Code Analysis
The codebase is a multi-tier enterprise application:
- **Languages**: 
  - **C++**: Core business logic and database access (`pxdb`, `libcsc`, `thrift`).
  - **C#**: Batch processing and utility tools (`AnalyseDeliveryadvices`, `Covid19XmlViewerBatch`).
  - **SQL/PL-SQL**: Database migrations and sequence management (`Informix`, `SQL Server`).
- **Core Components**:
  - `pxdb`: C++ persistence layer (Informix connection, article/order tables).
  - `thrift`: API definitions and handlers for various services (order, customer, shipment).
  - `kscserver`: Central server component.
  - `libcsc`: Shared C++ libraries.
- **Batch Processing**: C# applications handle external XML data (ASN, Orders) and delivery advice analysis.

## Full Template Analysis
- **Architecture**: Modular micro-services/components communicating via Thrift.
- **Data Model**: Centered around `articles`, `orders` (`tauftrag`), and `customers`. Extensive use of database-backed sequences.
- **Build System**: Makefile-based recursive builds for C++, MSBuild/Visual Studio for C#.
- **Integration**: Strong reliance on external host interfaces and XML-based data exchange.

## Conclusion
The implementation of CPR0002783 requires cross-component changes to ensure that unavailable products are correctly flagged in the `pxdb` layer and propagated through the Thrift handlers to the client applications.
