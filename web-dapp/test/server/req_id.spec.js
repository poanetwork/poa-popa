'use strict';
const req_id = require('../../server-lib/req_id');

describe('req_id', () => {
    it('should call next and not add x_ip', () => {
        // Given
        const req = {};
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(next).toHaveBeenCalled();
        expect(req).not.toHaveProperty('x_ip');
    });

    it('should add an identifier to the request', () => {
        // Given
        const req = {};
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_id).toBeTruthy();
        expect(next).toHaveBeenCalled();
    });

    it('should use different identifiers for different requests', () => {
        // Given
        const reqs = [...Array(100)].map(() => ({}));
        const res = {};
        const next = jest.fn();

        // When
        reqs.forEach(req => {
            req_id(req, res, next);
        });

        // Then
        const x_ids = reqs.map(req => req.x_id);
        const unique_x_ids = new Set(x_ids);
        expect(x_ids.length).toEqual(unique_x_ids.size);
        expect(next).toHaveBeenCalled();
    });

    it('should add the originating ip to the request object', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': '1.2.3.4',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    it('should remove the port', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': '1.2.3.4:80',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    it('should use the first address if there are several addresses', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': '1.2.3.4,1.2.3.5',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    describe('address starts with 192.168', () => {
        it('should use the second address, if present', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.168.0.1,1.2.3.4',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should remove the port of the second address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.168.0.1,1.2.3.4:80',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should use it if it\'s the only address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.168.0.1',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('192.168.0.1');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('address starts with 10', () => {
        it('should use the second address, if present', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '10.0.0.1,1.2.3.4',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should remove the port of the second address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '10.0.0.1,1.2.3.4:80',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should use it if it\'s the only address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '10.0.0.1',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('10.0.0.1');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('address starts with 192.0.0', () => {
        it('should use the second address, if present', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.0.0.1,1.2.3.4',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should remove the port of the second address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.0.0.1,1.2.3.4:80',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('1.2.3.4');
            expect(next).toHaveBeenCalled();
        });

        it('should use it if it\'s the only address', () => {
            // Given
            const req = {
                headers: {
                    'x-forwarded-for': '192.0.0.1',
                },
            };
            const res = {};
            const next = jest.fn();

            // When
            req_id(req, res, next);

            // Then
            expect(req.x_ip).toEqual('192.0.0.1');
            expect(next).toHaveBeenCalled();
        });
    });

    it('should use the second address if the first one is unknown', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': 'unknown,1.2.3.4',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    it('should use the second address even if there are more than two', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': 'unknown,1.2.3.4,1.2.3.5',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    it('should handle trailing commas', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': '1.2.3.4,',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('1.2.3.4');
        expect(next).toHaveBeenCalled();
    });

    it('should not add x_ip if the field is a single comma', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': ',',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req).not.toHaveProperty('x_ip');
        expect(next).toHaveBeenCalled();
    });

    it('should handle multiple ips with the first one being local and with port', () => {
        // Given
        const req = {
            headers: {
                'x-forwarded-for': '192.168.0.10:50000, 37.10.5.2',
            },
        };
        const res = {};
        const next = jest.fn();

        // When
        req_id(req, res, next);

        // Then
        expect(req.x_ip).toEqual('37.10.5.2');
        expect(next).toHaveBeenCalled();
    });
});
