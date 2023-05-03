var res_date = '';
var res_worker_id;
var res_document_number;
var res_unit_id;
var res_check_desk;
var res_check_park;


$('#datepicker').datepicker({
    format: 'yyyy-mm-dd',
}).on('changeDate', function(e) {
    console.log(e.format());
    res_date = e.format();
    renderReservations();
});


function pressButtonCreate() {
    console.log('Press Create Reservation');
    console.log('Work Id >> ' + res_worker_id);
    console.log('Date >> ' + res_date);
    if (res_worker_id == undefined) {
        console.log('Erro: é necessário solecionar um empregado');
        alert("Selecione um colaborador!");
        return;
    }
    $('#ModalReservation').modal('show');
     var label_date_reservation = document.getElementById('label_date_reservation');
     label_date_reservation.value = res_date;
}


function pressSaveModal() {
    console.log('Press Save Modal');
    res_unit_id = document.getElementById('select_unit').value;
    console.log('Unit_Id >> ' + res_unit_id);
     if (res_unit_id == 'Selecionar Unidade') {
        alert("Selecione uma Unidade!");
        return;
    }
    res_check_desk = document.getElementById('check_desk').checked;
    console.log('check_desk >> ' + res_check_desk);
    res_check_park = document.getElementById('check_park').checked;
    console.log('check_park >> ' + res_check_park);
    postReservation();
    renderMyReservations(res_document_number);
    pressButton();
    $('#ModalReservation').modal('toggle');

}


$(document).ready(function () {
    $('#datatable').DataTable();
})


function pressButton() {
   console.log('Buscar Colaborador');
   const cpf = document.getElementById('cpf');
   console.log('cpf >>' + cpf.value);
   res_document_number = cpf.value;
   renderWorker(cpf.value);
   renderMyReservations(cpf.value);
   renderReservations();
}


async function renderWorker(document_number) {
    let worker = await getWorker(document_number);
    console.log('Worker >> ' + worker.name);
    console.log('Worker >> ' + worker.id);
    let label_name = document.getElementById('label_name');
    label_name.value = worker.name;
    res_worker_id = worker.id;
     if (res_worker_id == undefined) {
        alert("Não foi encontrado um colaborador com este CPF!");
        return;
    }
}


async function getWorker(document_number) {
    let url = 'http://127.0.0.1:5000/api/v1/worker?document_number=' + document_number;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}


async function getMyReservations(document_number) {
    let url = 'http://127.0.0.1:5000/api/v1/reservation/reservation_by_document_number?document_number=' + document_number;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}


function convertToTicked(value) {
    if (value == '1') {
        return '✔';
    } else {
        return '';
     }
}


async function renderMyReservations(document_number) {
    let reservations = await getMyReservations(document_number);
    console.log('Atualizando reservas');
    console.log('Quantidade de Reservas >>' + reservations.length);
    console.log('Document_number >>' + document_number);
    var t = $('#datatable').DataTable();
    t.rows().remove();
    reservations.forEach(reservation => {
        console.log('Reservation >> ' + reservation.name);
        let vehicle = reservation.car_manufacturer + '-' + reservation.model + ', ' + reservation.color + ', ' + reservation.licence_plate;
        t.row.add([reservation.date_reservation, reservation.name, convertToTicked(reservation.is_included_desk), convertToTicked(reservation.is_included_parking) , vehicle]).draw(false);
    });
}


async function getReservations() {
    console.log('get Reservations date >>' + res_date);
    let url = 'http://127.0.0.1:5000/api/v1/reservation/reservation_by_date?date=' + res_date;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}


async function renderReservations() {
    let reservations = await getReservations();
    let html = '';
    reservations.forEach(reservation => {
        total_desk_reservation = (reservation.total_desk_reservation == null) ? 0 : reservation.total_desk_reservation;
        total_parking_reservation = (reservation.total_parking_reservation == null) ? 0 : reservation.total_parking_reservation;
        console.log('Reservation >> ' + total_desk_reservation);
        let progressBarDeskWidth = (total_desk_reservation / reservation.total_work_desks) * 100;
        let progressBarParkingWidth = (total_parking_reservation / reservation.total_parking_spaces) * 100;
        let htmlSegment  = `<Br>
                            <div class="row">
                                <div class="col-6">
                                    <h5 class="progress-title">${reservation.name}: Desks</h5>
                                    <div class="progress blue">
                                        <div class="progress-bar" style="width:${progressBarDeskWidth}%; background:#11beec;">
                                            <div class="progress-value">${total_desk_reservation}/${reservation.total_work_desks}</div>
                                        </div>
                                    </div>
                               </div>

                               <div class="col-6">
                                    <h5 class="progress-title">${reservation.name}: Parking</h5>
                                    <div class="progress blue">
                                        <div class="progress-bar" style="width:${progressBarParkingWidth}%; background:#11beec;">
                                            <div class="progress-value">${total_parking_reservation}/${reservation.total_parking_spaces}</div>
                                        </div>
                                    </div>
                               </div>
                             </div>`;
        html += htmlSegment;
        let container = document.querySelector('.container');
        container.innerHTML = html;

    });
}


async function postReservation() {
    console.log('Post Reservation');
    console.log('Work Id >>' + res_worker_id);
    console.log('Date >>' + res_date);
    console.log('Unit Id >>' + res_unit_id);
    console.log('res_check_desk >>' + res_check_desk);
    console.log('res_check_park >>' + res_check_park);
    let parameters = '?date=' + res_date + '&unit_id=' + res_unit_id + '&worker_id=' + res_worker_id + '&is_included_parking=' + res_check_desk + '&is_included_desk=' + res_check_park;
    let data = '';
    let url = 'http://127.0.0.1:5000/api/v1/reservation';
    const headers = {'Content-Type':'application/json',
                    'Access-Control-Allow-Origin':'*',
                    'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'}

    await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({    date: res_date,
                                worker_id: res_worker_id,
                                unit_id: res_unit_id,
                                is_included_desk: res_check_desk,
                                is_included_parking: res_check_park })
    }).then(res => res.json())
      .then(res => console.log(res));
}


