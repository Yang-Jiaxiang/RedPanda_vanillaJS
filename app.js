// async function fetchData(url) {
//     try {
//         await fetch(url, {
//             headers: {
//                 "Accept-Charset": "utf-8",
//                 Accept: "application/fhir+xml;q=1.0, application/fhir+json;q=1.0, application/xml+fhir;q=0.9,application/json+fhir;q=0.9",
//                 "User-Agent":
//                     "HAPI-FHIR/6.0.0-PRE8-SNAPSHOT (FHIR Client; FHIR 4.0.1/R4; apache)",
//                 "Accept-Encoding": "gzip",
//             },
//             mode: "cors",
//         }).then((response) => {
//             response.json().then(function (data) {
//                 document.getElementById("contend").innerHTML =
//                     data.entry[0].resource.id;

//                 console.log(data);
//             });
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }
// fetchData("https://hapi.fhir.org/baseR4/Patient");

// async function fetchData(url) {
//     try {
//         let response = await fetch(url, {
//             headers: {
//                 "Accept-Charset": "utf-8",
//                 Accept: "application/fhir+xml;q=1.0, application/fhir+json;q=1.0, application/xml+fhir;q=0.9,application/json+fhir;q=0.9",
//                 "User-Agent":
//                     "HAPI-FHIR/6.0.0-PRE8-SNAPSHOT (FHIR Client; FHIR 4.0.1/R4; apache)",
//                 "Accept-Encoding": "gzip",
//             },
//             mode: "cors",
//         });
//         let data = await response.text();
//         console.log(data);
//     } catch (error) {
//         console.log(error);
//     }
// }
// fetchData("https://hapi.fhir.org/baseR4/Patient");

async function loadIntoTable(url, header, Support, resource, table) {
    resource = resource.toLowerCase();
    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");
    const responseData = await fetch(url);
    const responseHeader = await fetch(header);
    const responseSupport = await fetch(Support);

    const { entry } = await responseData.json();
    const { headers } = await responseHeader.json();
    const { differential } = await responseSupport.json();

    // differential.element.map((item) => {
    //     item.mustSupport && console.log(item.id);
    // });

    tableHead.innerHTML = "<tr></tr>";
    tableHead.tableBody = "";

    //產生header
    for (const headerText of headers[resource]) {
        const headerElement = document.createElement("th");
        headerElement.textContent = headerText;
        tableHead.querySelector("tr").appendChild(headerElement);
    }

    //產生內容
    for (const row of entry) {
        const rowElement = document.createElement("tr");

        //按下table
        rowElement.addEventListener("click", () => {
            showHideRow(row.resource.id);
        });

        //根據header渲染row
        for (const header of headers[resource]) {
            const cellElement = document.createElement("td");

            //判斷值是否有下一層
            if (typeof row.resource[header] === "string") {
                cellElement.textContent = row.resource[header];
            } else if (typeof row.resource[header] === "object") {
                const html = objectToString(row.resource[header]);
                cellElement.innerHTML = html;
            }
            rowElement.appendChild(cellElement);
        }

        //expand 下方展開列
        const expand = document.createElement("tr");
        expandOpen(expand, row, headers, resource);

        tableBody.appendChild(rowElement);
        tableBody.appendChild(expand);
    }
}

//將object轉成string
function objectToString(jsons) {
    var html = "";
    for (var json of jsons) {
        var result = [];
        for (var i in json) result.push([i, json[i]]);
        result.map((item) => {
            html += `<b>${item[0]}</b>:`;
            html += `${JSON.stringify(item[1])},　`;
        });
    }
    return html;
}

//下方展開列
function expandOpen(expand, row, headers, resource) {
    console.log(row);
    function ExpanRender() {
        var html = `<button onclick="copyButtonFunction()">Copy Json</button>
        <a id="exportJSON" onclick="downJsonButton(this);" class="btn" download>Download Json</a>
        <textarea  style="width:100%;height:500px;" id="jsonTextarea" name="jsonTextarea">${JSON.stringify(
            row,
            undefined,
            2
        )}
        </textarea>`;
        // for (const header of headers[resource]) {
        //     if (typeof row.resource[header] === "object") {
        //         html += `<h5><b>${header}</b></h5>`;
        //         const htmlobj = objectToString(row.resource[header]);
        //         html += `<p>${htmlobj}</p>`;
        //     } else if (typeof row.resource[header] === "string") {
        //         html += `<h5><b>${header}</b></h5>`;
        //         html += `<p>${row.resource[header]}</p>`;
        //     }
        // }
        return html;
    }
    const html = ExpanRender();
    expand.id = row.resource.id;
    expand.className = "hidden_row";
    expand.innerHTML = `
            <td colspan=${headers[resource].length}>
                ${html}
            </td>

    
`;
}

//下方展開列
function showHideRow(row) {
    $("#" + row).toggle();
}

//複製按鈕
function copyButtonFunction() {
    var copyText = document.getElementById("jsonTextarea");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
}

function downJsonButton(el) {
    var copyText = document.getElementById("jsonTextarea");
    var data = "text/json;charset=utf-8," + encodeURIComponent(copyText.value);

    //console.log();

    const filename = `${JSON.parse(copyText.value).resource.resourceType}_${JSON.parse(copyText.value).resource.id}.json`;
    el.setAttribute("href", "data:" + data);
    el.setAttribute("download", `${filename}`);
}

loadIntoTable(
    "https://hapi.fhir.org/baseR4/Patient/",
    "./header.json",
    "./StructureDefinition-Patient-twcore.json",
    "Patient",
    document.querySelector("table")
);
