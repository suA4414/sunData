// 上下矢印キーでフォームのフィールドを移動可能にする
$('.form-control').on('keydown', function (e) {
    const fields = $('.form-control');
    const index = fields.index(this);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (index < fields.length - 1) {
            fields.eq(index + 1).focus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (index > 0) {
            fields.eq(index - 1).focus();
        }
    }
});

// 入力データのデータ構造
const SunData = [];

// 入力回数初期化 
let count_id = 0;

// どのくらい前の値に戻ったかを示す変数
let rev_preValue_count = 0;

// "*"ボタンで次に進み, "/"ボタンで前に戻る
$(document).on('keydown', function (e) {
    if (e.key === "*" && rev_preValue_count < 0) {
        rev_preValue_count++;
        console.log(`rev_preValue_count=${rev_preValue_count}`);
        if (rev_preValue_count != 0) {
            set_preValue(rev_preValue_count);
        } else {
            $('#input_form')[0].reset();
        }
    } else if (e.key === "/" && Math.abs(rev_preValue_count) < count_id) {
        rev_preValue_count--;
        console.log(`rev_preValue_count=${rev_preValue_count}`);
        if (rev_preValue_count != 0) {
            set_preValue(rev_preValue_count);
        }
    }
})

// フォームに値を格納する関数
function set_preValue(pre_count) {
    pre_count = count_id + pre_count;
    console.log(`pre_count=${pre_count}`);

    $('#result-table tr').each(function () {
        // 行見出しを取得
        let firstCell = $(this).find('th').first().text().trim();
        console.log(`firstCell=${firstCell}`)
        // 行見出しに対応する中身を取得
        let $tds = $(this).find('td');
        // 行見出しの値と戻る対象の値が同じならば、フォームに入力値をセットする
        if (Number(firstCell) === (pre_count + 1)) {
            let reverse_obj = {
                date: $tds.eq(0).text() + $tds.eq(1).text() + $tds.eq(2).text(),
                time: $tds.eq(3).text() + $tds.eq(4).text(),
                east_west: $tds.eq(5).text(),
                point_north: $tds.eq(6).text() + $tds.eq(7).text(),
                point_south: $tds.eq(8).text() + $tds.eq(9).text()
            };
            console.log(`フォームにセットする値：`, reverse_obj);

            $('#date').val(reverse_obj.date);
            $('#time').val(reverse_obj.time);
            $('#east_west').val(reverse_obj.east_west);
            $('#point_north').val(reverse_obj.point_north);
            $('#point_south').val(reverse_obj.point_south);
            console.log(`The form field value was reversed.`);
            return false;  // 見つかったらループ終了
        }
    });
}


// フォームのフィールドで指定文字を入力したら、次のフィールドに遷移させる
function moveToNext(current, nextId) {
    if (current.value.length === current.maxLength) {
        document.getElementById(nextId).focus();
    }
}

// フォームの東西欄の文字自動変換
function convert_EastWest(input) {
    const value = input.value;
    const converted = value
        .replace(/\+/g, 'E')    // "+" を "E" に変換
        .replace(/-/g, 'W')     // "-" を "W" に変換
        .replace(/e/g, 'E')     // "e" を "E" に変換
        .replace(/w/g, 'W');    // "w" を "W" に変換
    input.value = converted;
}

// フォームの端点欄の文字自動変換
function convert_NorthSouth(input) {
    const value = input.value;
    const converted = value
        .replace(/\+/g, 'N')    // "+" を "N" に変換
        .replace(/-/g, 'S')     // "-" を "S" に変換
        .replace(/n/g, 'N')     // "n" を "N" に変換
        .replace(/s/g, 'S');    // "s" を "S" に変換
    input.value = converted;
}

// 入力データの格納
function final_this_input() {
    const fields = ['date', 'time', 'east_west', 'point_north', 'point_south', 'check_data']

    // 入力欄を取得する
    const formData = {};
    for (let id of fields) {
        formData[id] = document.getElementById(id).value;
    }
    console.log('格納されたデータ:', formData)

    // フィールドをクリア
    for (let id of fields) {
        document.getElementById(id).value = '';
    }

    // 最初のフィールドにフォーカス
    document.getElementById('date').focus();




    // データをテープルに表示できる形式に変換
    SunData[count_id] = {
        // #
        id: count_id + 1,
        // 年
        year: formData.date.slice(0, 4),
        // 月
        month: formData.date.slice(4, 6),
        // 日
        day: formData.date.slice(6, 8),
        // 時
        hour: formData.time.slice(0, 2),
        // 分
        minute: formData.time.slice(2, 4),
        // 東西
        east_west: formData.east_west,
        // 端点1（南北）
        northPoint_NS: formData.point_north.slice(0, 1),
        // 端点1（絶対値）
        northPoint_abValue: formData.point_north.slice(1, 3),
        // 端点2（南北）
        southPoint_NS: formData.point_south.slice(0, 1),
        // 端点2（絶対値）
        southPoint_abValue: formData.point_south.slice(1, 3),
    }

    // 端点の絶対値が0ならば、符号を0にする
    if (Number(SunData[count_id].northPoint_abValue) == 0) {
        SunData[count_id].northPoint_NS = "0";
    }
    if (Number(SunData[count_id].southPoint_abValue) == 0) {
        SunData[count_id].southPoint_NS = "0";
    }



    // 正しければフォームデータをテープルに追加する
    // 但し、極端な値がある場合は追加しない。
    if (formData.check_data == 1 && remove_errorValue(SunData[count_id]) == 1) {
        $('#data_show').append(`
                <tr>
                    <th scope="row">${SunData[count_id].id}</th>
                    <td>${SunData[count_id].year}</td>
                    <td>${SunData[count_id].month}</td>
                    <td>${SunData[count_id].day}</td>
                    <td>${SunData[count_id].hour}</td>
                    <td>${SunData[count_id].minute}</td>
                    <td>${SunData[count_id].east_west}</td>
                    <td>${SunData[count_id].northPoint_NS}</td>
                    <td>${SunData[count_id].northPoint_abValue}</td>
                    <td>${SunData[count_id].southPoint_NS}</td>
                    <td>${SunData[count_id].southPoint_abValue}</td>
                </tr>
            `);
        // 入力完了を数える
        count_id += 1;
    } else {
        // 間違いデータは入力しない
        console.log("This is False Value.");
    }

    // どのくらい前の値に戻ったかをリセット
    rev_preValue_count = 0;
}

// 表のダウンロード
function downloadCSV() {
    const table = document.getElementById("result-table");
    let csv = "";

    // 各行をループ
    for (let row of table.rows) {
        const cells = [...row.cells].map(cell => {
            // ダブルクォートで囲って、カンマや改行を含む値に対応
            return `"${cell.textContent.trim().replace(/"/g, '""')}"`;
        });
        csv += cells.join(",") + "\n";
    }

    // CSVファイルとしてダウンロード
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "table_data.csv");
    link.click();
}

// 極端な値を排除する関数
function remove_errorValue(sun_data) {
    const year = Number(sun_data.year);
    const month = Number(sun_data.month);
    const day = Number(sun_data.day);
    const hour = Number(sun_data.hour);
    const minute = Number(sun_data.minute);

    const eastWest = sun_data.east_west; // "E" or "W"
    const northNS = sun_data.northPoint_NS; // "N" or "S"
    const southNS = sun_data.southPoint_NS; // "N" or "S"

    const northAbStr = sun_data.northPoint_abValue;
    const southAbStr = sun_data.southPoint_abValue;

    if (!Number.isInteger(year) || year < 1 || year > 9998) {
        console.log("Invalid year");
        return 0;
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        console.log("Invalid month");
        return 0;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        console.log("Invalid day");
        return 0;
    }
    if (!isValidDate(year, month, day)) {
        console.log("Invalid date");
        return 0;
    }
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        console.log("Invalid hour");
        return 0;
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
        console.log("Invalid minute");
        return 0;
    }

    // east_westは大文字の"E"か"W"のみ許容
    if (eastWest !== "E" && eastWest !== "W") {
        console.log("Invalid east_west");
        return 0;
    }

    // northPoint_NS, southPoint_NSは"N"か"S"か"0"のみ許容
    if (northNS !== "N" && northNS !== "S" && northNS !== "0") {
        console.log("Invalid northPoint_NS");
        return 0;
    }
    if (southNS !== "N" && southNS !== "S" && southNS !== "0") {
        console.log("Invalid southPoint_NS");
        return 0;
    }

    // 緯度は2桁数字文字列かチェック
    if (!/^\d{2}$/.test(northAbStr)) {
        console.log("Invalid northPoint_abValue format");
        return 0;
    }
    if (!/^\d{2}$/.test(southAbStr)) {
        console.log("Invalid southPoint_abValue format");
        return 0;
    }

    const northAbValue = Number(northAbStr);
    const southAbValue = Number(southAbStr);

    if (isNaN(northAbValue) || northAbValue < 0 || northAbValue > 90) {
        console.log("Invalid northPoint_abValue range");
        return 0;
    }
    if (isNaN(southAbValue) || southAbValue < 0 || southAbValue > 90) {
        console.log("Invalid southPoint_abValue range");
        return 0;
    }

    // 端点の絶対値が0でないのに符号が"0"である場合を除外
    if (northAbValue != 0 && northNS == "0") {
        console.log("Invalid northPoint_NS");
        return 0;
    }
    if (southAbValue != 0 && southNS == "0") {
        console.log("Invalid southPoint_NS");
        return 0;
    }

    // 入力された日付を調査
    if ((year === 0 && month === 0 && day === 0) || (year === 9999 && month === 99 && day === 99)) {
        console.log("Impossible date");
        return 0;
    }

    return 1;
}
function isValidDate(y, m, d) {
    const daysInMonth = [31, (isLeapYear(y) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return d <= daysInMonth[m - 1];
}
function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

