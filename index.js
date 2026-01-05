const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// โหลด tw-voucher ให้ชัวร์
let twvoucher;
const twPackage = require('@fortune-inc/tw-voucher');

if (typeof twPackage === 'function') {
    twvoucher = twPackage;
} else if (twPackage.voucher && typeof twPackage.voucher === 'function') {
    twvoucher = twPackage.voucher;
} else {
    twvoucher = twPackage.default || twPackage;
}

// health check
app.get('/', (req, res) => {
    res.json({
        status: 'ONLINE',
        service: 'TrueWallet Voucher API'
    });
});

// redeem endpoint
app.get('/redeem', async (req, res) => {
    const { phone, link } = req.query;

    if (!phone || !link) {
        return res.json({
            status: 'ERROR',
            message: 'Missing phone or link'
        });
    }

    if (!link.includes('gift.truemoney.com')) {
        return res.json({
            status: 'ERROR',
            message: 'Invalid voucher link'
        });
    }

    try {
        const result = await twvoucher(phone, link);

        if (result && result.amount) {
            return res.json({
                status: 'SUCCESS',
                amount: Number(result.amount),
                data: result
            });
        } else {
            return res.json({
                status: 'FAILED',
                message: 'Cannot redeem voucher'
            });
        }

    } catch (err) {
        return res.json({
            status: 'ERROR',
            message: err.message
        });
    }
});

// start server
app.listen(PORT, () => {
    console.log(`TrueWallet API running on port ${PORT}`);
});
