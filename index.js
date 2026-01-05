const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   โหลด tw-voucher ให้ใช้ได้แน่นอน
================================ */
let twvoucher;
const twPackage = require('@fortune-inc/tw-voucher');

if (typeof twPackage === 'function') {
    twvoucher = twPackage;
} else if (twPackage.voucher && typeof twPackage.voucher === 'function') {
    twvoucher = twPackage.voucher;
} else {
    twvoucher = twPackage.default || twPackage;
}

/* ===============================
   หน้าเช็คสถานะเซิร์ฟเวอร์
================================ */
app.get('/', (req, res) => {
    res.json({
        status: 'ONLINE',
        message: 'TrueWallet Voucher API is running'
    });
});

/* ===============================
   API รับซอง
   /redeem?phone=xxx&link=xxx
================================ */
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
        console.log(`[REDEEM] phone=${phone}`);

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
        console.error(err);
        return res.json({
            status: 'ERROR',
            message: err.message
        });
    }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
    console.log('=================================');
    console.log(' TrueWallet Voucher API');
    console.log(` Running on port ${PORT}`);
    console.log('=================================');
});
