# Sistema de Gestión Hospitalaria

El sistema de gestión hospitalaria está compuesto por dos componentes principales:

## Servidor Central (`central_hospital`)

El servidor centralizado gestiona funcionalidades críticas del sistema:

1. **Servicio de Inventario**: Administra los insumos hospitalarios y mantiene la base de datos central
2. **Servicio de Autenticación**: Valida las credenciales de todos los usuarios del sistema

## Sistema de Departamento

Cada departamento dispone de un sistema independiente para gestionar sus insumos específicos:

1. **Sistema de Alertas**: Notifica cuando los niveles de insumos son bajos
2. **Servicio de Autenticación**: Autentica usuarios a nivel departamental
3. **Servicio de Reportes**: Genera informes sobre el estado de los insumos

